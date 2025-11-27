# Playwright + Chromium oldindan o‘rnatilgan rasm
FROM mcr.microsoft.com/playwright:v1.57.0-jammy


# Ishchi papka
WORKDIR /

# Package.json fayllarni ko‘chirib olamiz
COPY package*.json ./

# Kutubxonalarni o‘rnatamiz
RUN npm install --omit=dev

# Barcha kodni ko‘chirib olamiz
COPY . .

# Server porti
EXPOSE 3000

# Serverni ishga tushiramiz
CMD ["node", "index.cjs"]
