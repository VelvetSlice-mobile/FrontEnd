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
- Garanta que `.env` esteja no `.gitignore` antes de subir alteracoes.

## Integracao de branches (sem mexer na main)

Fluxo recomendado para integrar outras frentes (ex.: login e notificacoes) sem quebrar sua branch:

1. Trabalhe na sua branch:

```bash
git checkout <sua-branch>
git pull
```

2. Traga a branch de login:

```bash
git merge <branch-login>
```

3. Resolva conflitos e valide o app:
- login valido/invalido
- cadastro
- checkout
- lista de pedidos

4. Traga a branch de notificacoes:

```bash
git merge <branch-notificacoes>
```

5. Resolva conflitos e teste novamente antes de abrir PR.

Pontos comuns de conflito no FrontEnd:
- `src/contexts/AuthContext.jsx`
- `src/services/api.js`
- `src/services/database.js`
- `app/login.jsx`
- `app/register.jsx`
- `app/checkout.jsx`

## Erros comuns em outras maquinas

### App abre, mas API nao responde

- Backend nao iniciou.
- `EXPO_PUBLIC_API_URL` esta com IP errado.
- Celular e PC nao estao na mesma rede.

### Mudou de rede e parou de funcionar

- Atualize o `.env` com o novo IPv4 da maquina do BackEnd.
- Reinicie o Expo com `--clear`.

### Erro ao instalar dependencias

- Apague `node_modules` e rode `npm install` novamente.
- Garanta Node 20 LTS.
