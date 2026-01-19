
# 🚀 HeloTube - YouTube Clone 4K

Bem-vindo ao **HeloTube**, a plataforma de vídeos inspirada no YouTube, personalizada para a Helo!

## 🛠️ Como colocar no ar (Deploy)

1. **GitHub**:
   - Crie um novo repositório no GitHub.
   - Use os comandos:
     ```bash
     git init
     git add .
     git commit -m "feat: HeloTube 4K"
     git remote add origin SUA_URL_AQUI
     git push -u origin main
     ```

2. **Vercel**:
   - Conecte sua conta do GitHub na Vercel.
   - Importe este projeto.
   - Em **Environment Variables**, adicione sua `API_KEY` do Gemini.
   - Clique em **Deploy**.

## ☁️ Configuração Cloudinary

Para que os uploads funcionem:
1. Crie conta no Cloudinary.
2. Configure um **Unsigned Upload Preset**.
3. No arquivo `App.tsx`, substitua `seu_cloud_name` e `seu_upload_preset` pelos seus dados.

## 📱 Vídeos em Pé (Shorts)
O site detecta automaticamente se o vídeo foi gravado na vertical e o envia para a seção de **Shorts**.

---
*Desenvolvido com carinho para a Helo.*
