# Playwright + Chromium oldindan o‘rnatilgan image
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app

# Ngrok 3.x o'rnatish
RUN apt-get update && apt-get install -y curl unzip \
    && curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-stable-linux-amd64.zip -o ngrok.zip \
    && unzip ngrok.zip && mv ngrok /usr/local/bin/ && rm ngrok.zip

# Authtokenni ENV orqali berish
ENV NGROK_AUTHTOKEN=363hFbssFldyqupRbnsGhB18hL4_82BuGUEd3CpoMHbR74vsk

# Tokenni ngrok 3.x bilan o‘rnatish
RUN ngrok authtoken $NGROK_AUTHTOKEN

# App fayllar
COPY package*.json ./
RUN npm install --omit=dev
RUN apt-get install -y jq

COPY . .

EXPOSE 3000

# Server + ngrok + URLni terminalga chiqarish
CMD ["sh", "-c", "\
  node index.cjs & \
  ngrok http 3000 --log=stdout & \
  sleep 5 && \
  URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url') && \
  echo 'Ngrok tunnel URL:' $URL && wait \
"]
