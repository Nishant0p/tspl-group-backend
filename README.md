# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

### Railway

This project is pre-configured for Railway with [railway.json](railway.json).

1. Push this repository to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add a PostgreSQL service in the same Railway project.
4. Open your backend service and set these environment variables:

```
NODE_ENV=production
HOST=0.0.0.0
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

APP_KEYS=<random1,random2>
API_TOKEN_SALT=<random>
ADMIN_JWT_SECRET=<random>
TRANSFER_TOKEN_SALT=<random>
JWT_SECRET=<random>
ENCRYPTION_KEY=<random>

WABA_API_KEY=<provider value>
WABASMSBOX_API_KEY=<provider value>
WABA_BOT_ID=<provider value>
WABASMSBOX_BOT_ID=<provider value>
WABASMSBOX_RCS_ENDPOINT=https://wabasmsbox.com/REST/direct/sendRCS
WABASMSBOX_TEMPLATE_ENDPOINT=https://wabasmsbox.com/REST/direct/getRcsTemplateJson
LEAD_RCS_BOT_ID=<provider value>
LEAD_TEMPLATE_CODE=Universal
LEAD_SMS_SENDER_ID=<provider value>
LEAD_SMS_ENTITY_ID=<provider value>
LEAD_SMS_TEMP_ID=<provider value>
LEAD_SMS_TEXT=Hi {name}, thank you for contacting TSPL Group. Our team will connect with you shortly.
```

5. Deploy.

Railway will run the configured build and start commands:

- Build: `npm run build`
- Start: `npm run start`

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
