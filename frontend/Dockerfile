FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# We use standard dev server since this is orchestrated for a quick hackathon demo.
# For true production, we'd use `npm run build` and `npm start`.
EXPOSE 3000

CMD ["npm", "run", "dev"]
