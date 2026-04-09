# Velvet Slice FrontEnd

Aplicativo mobile em React Native (Expo) para o projeto Velvet Slice.

## Requisitos

- Node.js 20 LTS (recomendado)
- npm 10+
- Expo Go no celular (Android/iOS)

Observacao:
Com Node 24, algumas maquinas podem apresentar erros no Expo CLI.

## Instalacao

1. Instale as dependencias:

	npm install

## Configuracao de ambiente

Crie o arquivo .env na raiz do FrontEnd com:

EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000

Exemplo de IP local:

EXPO_PUBLIC_API_URL=http://192.168.1.10:3000

Como descobrir seu IP local no Windows:

ipconfig

Use o valor de IPv4 da sua rede Wi-Fi.

## Como rodar

1. Suba o backend (no repositorio BackEnd, separado):

	npm start

2. Suba o frontend:

	PowerShell:
	$env:EXPO_NO_DOCTOR='1'
	npx expo start --lan --clear

3. Abra o Expo Go e escaneie o QR Code.

## Troubleshooting

### Erro de rede no celular

- Verifique se celular e PC estao na mesma rede Wi-Fi.
- Confirme se EXPO_PUBLIC_API_URL aponta para o IP correto do PC.
- Teste no navegador do PC: http://SEU_IP_LOCAL:3000/

### Erro no Expo ao iniciar

- Rode com cache limpo:

  npx expo start --lan --clear

- Se ainda falhar:

  npx expo start --offline --lan --clear

### Mudou de rede Wi-Fi e parou de funcionar

- Atualize o IP no arquivo .env.
- Reinicie o Expo.

### Porta 3000 em uso no backend

- Feche processos antigos da API e suba novamente.

## Seguranca

- Nao commitar .env.
- O .gitignore ja esta configurado para ignorar .env e variacoes.
