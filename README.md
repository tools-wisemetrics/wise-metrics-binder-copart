This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Crie o arquivo local de configuração:

```bash
cp .env.example .env.local
openssl rand -base64 32
```

Use o valor gerado como `AUTH_SECRET` e preencha `DASHBOARD_USERS` em
`.env.local` com os usuários autorizados. Nunca envie esse arquivo ao
repositório.

Depois, inicie o servidor:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O acesso a todas as rotas
de `/dashboard` exige uma sessão autenticada, que expira após 12 horas.

> O login atual aceita a lista de usuários em `DASHBOARD_USERS`. Para MFA,
> recuperação de senha, auditoria ou permissões por papel, integre um
> provedor de identidade corporativo.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
