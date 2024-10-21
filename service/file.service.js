const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class FileService {
    save(base64Image) {
        try {
            const fileName = uuidv4() + '.jpg';
            const currentDir = __dirname; // server - yo'l
            const staticDir = path.join(currentDir, '..', 'static');
            const filePath = path.join(staticDir, fileName);

            // Rasm fayli saqlanadigan joyni tekshirish
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            // base64 tasvirni faylga yozish
            const base64Data = base64Image.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFileSync(filePath, base64Data, 'base64');

            return fileName;
        } catch (error) {
            throw new Error(`Error saving file: ${error}`);
        }
    }
}

module.exports = new FileService();
