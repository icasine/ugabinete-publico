# uGabinete (ugabinete.com.br)

Portal e vitrine simples para catálogo de ferramentas web. 

O site é 100% estático, leve, acessível e sem inteligência artificial ou servidores adicionais, pronto para ser hospedado gratuitamente no **Cloudflare Pages**.

---

## 1. Como Publicar no Cloudflare Pages ligado ao GitHub

O Cloudflare Pages atualiza o seu site automaticamente sempre que você enviar alterações para o seu repositório no GitHub.

### Passo a passo:
1. Acesse o painel do [Cloudflare Dashboard](https://dash.cloudflare.com/) e faça login.
2. No menu lateral, clique em **Workers e Pages** e depois no botão **Criar aplicação** (ou **Create application**).
3. Selecione a aba **Pages** e clique em **Conectar ao Git** (Connect to Git).
4. Escolha a sua conta do GitHub e selecione o repositório do **uGabinete**.
5. Na tela de configuração de build (**Configurações de compilação**):
   - **Framework predefinido (Preset)**: selecione `Vite` (ou `Nenhum`).
   - **Comando de build (Build command)**: `npm run build`
   - **Diretório de saída (Build output directory)**: `dist`
   - **Variáveis de ambiente**: Não é necessária nenhuma variável.
6. Clique em **Salvar e implantar** (Save and Deploy).
7. Aguarde cerca de 1 a 2 minutos. O Cloudflare fornecerá um endereço gratuito com final `.pages.dev`.

---

## 2. Como Ligar o Domínio Personalizado `ugabinete.com.br`

Depois de publicado no Cloudflare Pages:

1. No painel do seu projeto no Cloudflare Pages, clique na aba **Domínios personalizados** (Custom domains).
2. Clique no botão **Configurar um domínio personalizado** (Set up a custom domain).
3. Digite `ugabinete.com.br` (e opcionalmente `www.ugabinete.com.br`).
4. Clique em **Continuar**.
5. Se o seu domínio já estiver com o DNS gerenciado na Cloudflare:
   - A Cloudflare adicionará os apontamentos de DNS automaticamente com 1 clique.
6. Se o domínio estiver no Registro.br ou em outro provedor de DNS:
   - Crie um registro do tipo **CNAME** apontando para o seu subdomínio do Pages (exemplo: `ugabinete.pages.dev`).
7. O certificado de segurança SSL (HTTPS) é gerado automaticamente e de graça pela Cloudflare em poucos minutos.

---

## 3. Como Adicionar ou Editar Ferramentas no `public/ferramentas.json`

Todas as ferramentas do site ficam cadastradas em um único arquivo: **`public/ferramentas.json`**.  
Você pode editá-lo diretamente pelo site do GitHub clicando no ícone do lápis.

### Bloco Modelo para Copiar e Colar:

Para adicionar uma nova ferramenta, insira uma vírgula após a última ferramenta existente e cole o bloco abaixo antes do colchete final `]`:

```json
{
  "id": "nome-da-ferramenta",
  "nome": "Nome Visível da Ferramenta",
  "resumo": "Uma frase curta explicando o que ela faz.",
  "descricao": "Explicação mais detalhada sobre a finalidade da ferramenta e seus benefícios para o usuário.",
  "categoria": "Utilidades",
  "url": "https://link-da-sua-ferramenta.com",
  "exigeLogin": false,
  "destaques": [
    "Primeiro recurso ou vantagem importante",
    "Segundo recurso prático da ferramenta",
    "Terceiro recurso relevante"
  ],
  "comoUsar": [
    "Acesse a ferramenta pelo botão 'Abrir ferramenta agora'.",
    "Preencha as informações solicitadas na tela inicial.",
    "Clique no botão de confirmação para obter o resultado."
  ],
  "imagemDemo": ""
}
```

### Explicação dos Campos:
- **`id`**: Deve conter apenas letras minúsculas, números e traços, sem espaços nem acentos (ex: `calculadora-prazos`). Ele é usado para criar o link direto: `ugabinete.com.br/#calculadora-prazos`.
- **`nome`**: Nome principal exibido no card e no título da janela.
- **`resumo`**: Frase direta de 1 linha exibida no card principal.
- **`descricao`**: Texto completo exibido dentro da seção "Para que serve".
- **`categoria`**: Nome da categoria (ex: *Documentos*, *Gestão*, *Calculadoras*, *Consultas*).
- **`url`**: Endereço completo do site da ferramenta (lembre-se de incluir `https://`).
- **`exigeLogin`**: Coloque `true` se a ferramenta exigir cadastro/senha própria, ou `false` se for de acesso livre.
- **`destaques`**: Lista de pontos fortes ou recursos principais (entre aspas).
- **`comoUsar`**: Passo a passo numerado de instruções para o usuário.
- **`imagemDemo`**: Caminho da imagem de exemplo (ex: `"/demos/calculadora.png"`) ou vazio `""`.

> **Observação:** O campo de busca e o filtro de categorias aparecem automaticamente assim que houver 6 ou mais ferramentas cadastradas.

---

## 4. Como Adicionar Imagens de Demonstração

1. Coloque o arquivo de imagem dentro da pasta **`public/demos/`** (por exemplo, `painel.png`).
2. No arquivo `public/ferramentas.json`, preencha o campo correspondente:
   ```json
   "imagemDemo": "/demos/painel.png"
   ```
3. Se a ferramenta não tiver imagem, deixe o campo com aspas vazias (`""`). O site continuará elegante sem exibir moldura quebrada.

---

## 5. Aplicativo no Celular (PWA) e Imagens de Ícones Recomendadas

O site já conta com suporte a **Progressive Web App (PWA)**, permitindo instalação na tela inicial de celulares (Android e iPhone) e computadores, abrindo em tela cheia como se fosse um aplicativo nativo.

Atualmente, o site utiliza o vetor `public/icon.svg` de alta resolução. Para garantir 100% de compatibilidade em versões antigas de navegadores e aparelhos, você pode colocar na pasta `public/` as seguintes versões em formato PNG:

1. **`public/pwa-192x192.png`** (192 × 192 pixels) — Ícone padrão para Android / Chrome.
2. **`public/pwa-512x512.png`** (512 × 512 pixels) — Ícone de alta definição para tela de abertura (splash screen) e lojas web.
3. **`public/apple-touch-icon.png`** (180 × 180 pixels) — Ícone específico utilizado pelo Safari no iPhone / iPad.

Para gerar esses PNGs, basta converter o arquivo `public/icon.svg` em qualquer conversor gratuito de SVG para PNG (ou software de imagens como Figma/Photoshop).
