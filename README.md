# Velvet Slice — FrontEnd

Aplicativo mobile do projeto Velvet Slice para compra de bolos artesanais.

**Stack:** React Native + Expo SDK 54 + expo-router

---

## Requisitos

- Node.js 20 LTS (recomendado)
- npm 10+
- Expo Go instalado no celular (Android ou iOS)
- BackEnd da Velvet Slice rodando (veja o README do BackEnd)

> Com Node 24, algumas máquinas podem apresentar erros no Expo CLI. Use Node 20 para evitar problemas.

---

## Instalação do zero (a partir do git)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd Velvet/FrontEnd

# 2. Instale as dependências
npm install

# 3. Crie o arquivo de variáveis de ambiente
# (veja a seção "Configuração de ambiente" abaixo)

# 4. Suba o app
npm start
```

---

## Configuração de ambiente

Crie o arquivo `.env` na raiz do FrontEnd:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Como descobrir seu IP local no Windows:

```bash
ipconfig
```

Use o valor de **IPv4** da sua rede Wi-Fi (ex: `192.168.x.x`).

> **Não use `127.0.0.1` ou `localhost`** — o celular não consegue acessar o PC por esses endereços. Use sempre o IP local da rede Wi-Fi.

> Nunca commite o `.env`. O `.gitignore` já está configurado para ignorá-lo.

---

## Como rodar

### 1. Suba o BackEnd primeiro

```bash
# Na pasta BackEnd
npm run dev
```

### 2. Suba o FrontEnd

```bash
npm start
```

> `npm start` já executa o `expo start`.

Se precisar forçar rede local e limpar cache (PowerShell):

```powershell
$env:EXPO_NO_DOCTOR='1'
npx expo start --lan --clear
```

### 3. Abra no celular

Abra o **Expo Go** e escaneie o QR Code exibido no terminal.

---

## Estrutura do projeto

```
FrontEnd/
├── app/                        # Telas (roteamento por arquivo — expo-router)
│   ├── index.jsx               # Loja (home do cliente)
│   ├── login.jsx               # Login e cadastro admin (modal oculto)
│   ├── register.jsx            # Cadastro de cliente
│   ├── profile.jsx             # Perfil do cliente
│   ├── orders.jsx              # Pedidos do cliente
│   ├── cart.jsx                # Carrinho
│   ├── checkout.jsx            # Finalização de compra
│   ├── notifications.jsx       # Notificações
│   ├── search.jsx              # Busca de produtos
│   ├── product/[id].jsx        # Detalhes do produto
│   ├── settings/
│   │   ├── edit-name.jsx       # Alterar nome
│   │   ├── edit-phone.jsx      # Alterar telefone
│   │   ├── edit-email.jsx      # Alterar e-mail
│   │   └── edit-password.jsx   # Alterar senha
│   └── admin/
│       ├── index.jsx           # Dashboard admin (home)
│       ├── pedidos.jsx         # Lista de pedidos (admin)
│       ├── pedido-detalhado.jsx# Detalhes e status do pedido
│       ├── produtos.jsx        # Lista de produtos (admin)
│       ├── novo-bolo.jsx       # Cadastrar novo produto
│       ├── editar-bolo.jsx     # Editar produto existente
│       └── perfil.jsx          # Perfil do admin
├── src/
│   ├── components/             # Componentes reutilizáveis
│   ├── constants/              # Colors, Fonts, Images
│   ├── contexts/               # AuthContext, CartContext, NavContext, ToastContext
│   ├── data/                   # Produtos locais (fallback offline)
│   └── services/
│       ├── api.js              # Todas as chamadas à API
│       └── database.js         # Banco local SQLite (expo-sqlite)
└── assets/
```

---

## Área do cliente

### Loja (Home)

- Exibe ofertas em destaque, categorias e grade de produtos
- Produtos são carregados da API; se offline, usa dados locais como fallback
- Filtro por categoria: Bolo, Choco, Frutas, Doces

### Produto

- Imagem, descrição, preço por kg
- Seletor de tamanho e quantidade
- Seção de avaliações com nota e comentário
- Botão para adicionar ao carrinho

### Carrinho

- Lista de itens com quantidade e subtotal
- Campo para inserir cupom de desconto
- Total atualizado em tempo real

### Checkout

- Confirmar endereço de entrega
- Finalizar pedido (integração Mercado Pago — método de pagamento selecionado diretamente no app do MP)

### Pedidos

- Abas por status: Preparando → Em rota → Entregue → Recusado
- Atualiza automaticamente ao focar a tela
- Botão "Mais informações" em cada card: exibe método de pagamento, endereço de entrega, cupom aplicado e status
- Ao voltar do Mercado Pago, o app detecta automaticamente o resultado (aprovado, recusado ou em processamento)

### Perfil

- Alterar nome, telefone, e-mail e senha
- Trocar foto de perfil (câmera ou galeria)
- Gerenciar endereços (adicionar, editar, excluir)
- Seção "Meus comentários" — editar ou excluir avaliações feitas
- "Limpar histórico local" — apaga pedidos e notificações salvos localmente no dispositivo

### Notificações

- Registradas localmente quando o status de um pedido muda

---

## Área do admin

### Como acessar o painel admin

1. Vá para a tela de **Login**
2. Toque **3 vezes rapidamente** no título "Velvet Slice" — um modal de cadastro admin abrirá
3. Preencha: nome, telefone, e-mail, senha e o **código de acesso** (definido em `ADMIN_REGISTER_CODE` no BackEnd)
4. Toque em "Cadastrar Admin"
5. Faça login — o app detecta `role: "admin"` e redireciona automaticamente ao painel `/admin`

> O código de acesso existe **somente no BackEnd**. Nunca coloque esse valor no `.env` do FrontEnd.

### Dashboard (Home admin)

- Resumo: total de pedidos e valor total de vendas
- Lista dos produtos mais vendidos com imagem, status e preço
- Campo de busca para filtrar produtos na lista

### Pedidos (admin)

- Todos os pedidos com filtro por status
- Toque em um pedido para ver: cliente, endereço, itens e valor
- Alterar status do pedido: `Pendente` → `Em preparo` → `Saiu para entrega` → `Entregue` / `Cancelado`

### Produtos (admin)

- Lista completa de bolos cadastrados
- Indicador de ativo/inativo
- Ação rápida para ativar ou desativar (produto inativo não aparece na loja)
- Botão para cadastrar novo produto

### Cadastrar / Editar produto

- Nome, descrição e preço
- Upload de imagem diretamente pelo app (câmera ou galeria)
- Imagem enviada para o servidor e vinculada ao produto

### Perfil (admin)

- Alterar nome, telefone, e-mail e senha
- Trocar foto de perfil
- Botão de sair da conta

---

## Guia de testes

### Fluxo completo do cliente

1. Cadastre uma conta na tela de registro
2. Faça login → será redirecionado para a loja
3. Navegue pelos produtos e adicione um ao carrinho
4. No carrinho, aplique um cupom (ex: `VELVET10`) e verifique o desconto
5. Finalize o pedido no checkout
6. Acesse "Meus pedidos" no perfil e veja o pedido com status "Preparando"
7. Acesse um produto, deixe uma avaliação com nota e comentário
8. No perfil, seção "Meus comentários", edite e depois exclua a avaliação
9. Adicione um endereço no perfil, edite-o e depois exclua

### Fluxo completo do admin

1. Crie uma conta admin (veja "Como acessar o painel admin")
2. Faça login → será redirecionado para `/admin`
3. No dashboard, confira o resumo de pedidos e vendas
4. Cadastre um novo produto com nome, preço e imagem
5. Desative o produto e confirme que ele some da loja do cliente
6. Reative o produto e confirme que volta a aparecer
7. Abra um pedido criado pelo cliente e altere o status
8. Confirme no app do cliente que o status foi atualizado

### Testando cupons

Cupons já cadastrados no banco (seed):

| Código | Desconto |
|--------|----------|
| `VELVET10` | R$ 10,00 |
| `DESCONTO20` | R$ 20,00 |
| `PRIMEIRA` | R$ 15,00 |

Ou crie um novo via PowerShell (requer token de admin):

```powershell
Invoke-RestMethod -Method POST -Uri 'http://SEU_IP:3000/api/dashboard/cupons' `
  -ContentType 'application/json' `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"codigo":"TESTE10","desconto_tipo":"percent","desconto_valor":10}'
```

---

## Troubleshooting

### Erro de rede no celular

- Verifique se celular e PC estão na **mesma rede Wi-Fi**
- Confirme se `EXPO_PUBLIC_API_URL` aponta para o IP correto do PC (não `localhost`)
- Teste no navegador do celular: `http://SEU_IP:3000/` — deve exibir "Servidor Velvet Slice Online!"
- Reinicie o BackEnd e o Expo após trocar de rede

### Expo não inicia / erro ao escanear QR Code

```bash
# Limpar cache
npx expo start --lan --clear

# Se ainda falhar
npx expo start --offline --lan --clear
```

### Mudou de rede Wi-Fi e parou de funcionar

- Atualize o IP no `.env` do FrontEnd
- Reinicie o Expo

### Imagens dos produtos não aparecem

- Confirme que `EXPO_PUBLIC_API_URL` está correto
- As imagens são servidas pelo BackEnd em `/uploads/products/`
- Produtos sem imagem cadastrada exibem um placeholder

### App redireciona para login sem motivo

- O token de sessão expirou ou é inválido
- Faça login novamente
- Se ocorrer repetidamente, verifique se `CLIENT_TOKEN_SECRET` não mudou no BackEnd

### Porta 3000 em uso no BackEnd

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

---

## Segurança

- Nunca commite o `.env`
- O `.gitignore` já está configurado para ignorar `.env` e variações
- O código de acesso admin (`ADMIN_REGISTER_CODE`) existe **somente no BackEnd** — nunca coloque esse valor no `.env` do FrontEnd
