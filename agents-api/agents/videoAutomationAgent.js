const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const STORAGE_PATH = path.join(__dirname, '../storage/videos');
const TEMP_PATH = path.join(__dirname, '../storage/temp');

/**
 * Agente de Automação de Vídeo IA
 */
const videoAutomationAgent = async (req, res) => {
    const { style = 'clean', objective = 'Cortes virais para Reels' } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
        return res.status(400).json({ error: 'Nenhum vídeo enviado.' });
    }

    const videoId = uuidv4();
    const originalExt = path.extname(videoFile.originalname);
    const tempInput = videoFile.path;

    try {
        console.log(`[Video Agent] Analisando vídeo: ${videoFile.originalname}...`);

        // 1. Upload para o Google AI File Manager (para o Gemini "assistir")
        const uploadResponse = await fileManager.uploadFile(tempInput, {
            mimeType: videoFile.mimetype,
            displayName: videoFile.originalname,
        });

        // Aguarda o processamento do vídeo no Google (Polling)
        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === 'PROCESSING') {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === 'FAILED') {
            throw new Error('Falha no processamento do vídeo pela IA.');
        }

        // 2. Pedir análise para o Gemini 1.5 Pro
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const prompt = `Analise este vídeo com foco em: ${objective}. 
        Identifique os 3 melhores momentos para Shorts/Reels (máximo 60s cada).
        Retorne APENAS um JSON no formato:
        [
            { "start": "HH:MM:SS", "end": "HH:MM:SS", "caption": "Título do momento", "repurpose": "Resumo para blog" }
        ]`;

        const result = await model.generateContent([
            { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
            { text: prompt },
        ]);

        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const highlights = JSON.parse(cleanJson);

        console.log(`[Video Agent] IA identificou ${highlights.length} momentos.`);

        // 3. Processar cortes com FFmpeg
        const outputs = [];
        for (let i = 0; i < highlights.length; i++) {
            const highlight = highlights[i];
            const outputFilename = `${videoId}_cut_${i}${originalExt}`;
            const outputPath = path.join(STORAGE_PATH, outputFilename);

            await new Promise((resolve, reject) => {
                let command = ffmpeg(tempInput)
                    .setStartTime(highlight.start)
                    .setDuration(calculateDuration(highlight.start, highlight.end))
                    // Crop para vertical (9:16) - assume vídeo horizontal como entrada
                    .videoFilters([
                        'crop=ih*9/16:ih' 
                    ]);

                // Aplica legenda se solicitado
                if (style !== 'clean') {
                    const captionText = highlight.caption.toUpperCase();
                    command.videoFilters([
                        'crop=ih*9/16:ih',
                        `drawtext=text='${captionText}':fontcolor=yellow:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5`
                    ]);
                }

                command
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            // Registrar no Vault (SQLite)
            const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
            db.prepare('INSERT INTO video_vault (id, filename, original_name, status, style, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
              .run(`${videoId}_${i}`, outputFilename, highlight.caption, 'ready', style, expiresAt);

            outputs.push({
                id: `${videoId}_${i}`,
                url: `/api/videos/${outputFilename}`,
                title: highlight.caption,
                repurpose: highlight.repurpose
            });
        }

        res.json({
            success: true,
            originalVideo: videoFile.originalname,
            highlights: outputs
        });

    } catch (err) {
        console.error('[Video Agent Error]', err);
        res.status(500).json({ error: 'Erro ao processar vídeo com IA.', details: err.message });
    } finally {
        // Limpa arquivos temporários
        if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    }
};

// Utilitário para cálculo de duração
function calculateDuration(start, end) {
    const s = start.split(':').map(parseFloat);
    const e = end.split(':').map(parseFloat);
    const startSec = s[0] * 3600 + s[1] * 60 + s[2];
    const endSec = e[0] * 3600 + e[1] * 60 + e[2];
    return endSec - startSec;
}

module.exports = videoAutomationAgent;
