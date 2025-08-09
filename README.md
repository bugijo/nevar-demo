# Nevar – Demo (Vite + React + TS + Tailwind)

Protótipo de apresentação para empresa de refrigeração (**Nevar**). Multiplataforma (PWA no navegador; base para Android/iOS/Windows/Mac).

## Rodar localmente
```bash
npm i
npm run dev
```

Abra http://localhost:5173

- Primeiro acesso cria o **Administrador** (bootstrap).
- Depois, faça **login** e navegue pelos módulos.

## Dois links (Painel e Site)
O app suporta duas experiências do **mesmo código**:

- **Painel (admin)**: visão padrão
- **Site institucional**: usar `?site=1` no link ou variável de ambiente.

### Como gerar dois links diferentes
**Opção A – Um deploy, dois links:**  
- Link principal: `https://seu-deploy.vercel.app` (Painel)  
- Link do site: `https://seu-deploy.vercel.app/?site=1`

**Opção B – Dois projetos no Vercel a partir do mesmo repositório:**  
- Projeto 1 (Painel): sem variáveis extras  
- Projeto 2 (Site): defina a env `VITE_DEFAULT_VIEW=site`  
Assim você terá dois domínios separados.

## Deploy (Vercel)
1. Suba o repo no GitHub.
2. Acesse Vercel > **Add New Project** > importe o repositório.
3. Build Command: `npm run build`  
   Output: `dist`
4. (Opcional) Crie **segundo projeto** com env `VITE_DEFAULT_VIEW=site` para ter o link do site.

### Deploy via GitHub Actions (alternativo)
Adicione secrets no repositório:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

O workflow `.github/workflows/deploy-vercel.yml` já está incluso.

## Deploy (Netlify)
- Site ID e Token em secrets:
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`
- Workflow `.github/workflows/deploy-netlify.yml` incluso.

## PWA
Este demo não adiciona service worker; pode-se incluir `vite-plugin-pwa` depois.

## Avisos (Demo)
- Sem backend; usa `localStorage` apenas para apresentar as telas/fluxos.
- Senhas usam hash **falso** (não usar em produção).
- Após fechar a venda, plugamos API, banco, fiscal e pagamentos.
