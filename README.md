# React + Vite

## Admin workspace

The administrator workspace is available at `/admin`. It requires an admin
account and a running MongoDB-backed server. Copy `server/.env.example` to
`server/.env` and set `MONGO_URI`, a private `JWT_SECRET`, and an administrator
email and password:

```text
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-unique-password-of-at-least-12-characters
ADMIN_NAME=Store Administrator
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
FRONTEND_URL=http://localhost:5173
```

On server startup, the account matching `ADMIN_EMAIL` is assigned the admin
role. If it does not exist, it is created with the configured password. Keep
these values private, and change the bootstrap password after first setup if
you have an existing password-management process. Regular customer
registration cannot assign an admin role.

Sign in through the storefront using the configured admin account. The
workspace supports catalog management, order-status updates, and customer
summaries. The first admin visit imports the starter catalog into MongoDB if
the product collection is empty. Checkout supports Cash on Delivery and
Razorpay Standard Checkout. Add the Razorpay **test** key ID and secret from
your Razorpay dashboard to `server/.env`; the key secret stays on the server.
Online payments are created and verified server-side in INR before an order is
marked paid. Store prices and shipping thresholds are displayed in INR. Use
Razorpay test mode until your account is ready for live payments.
Set `VITE_API_URL` at build time to override the default
`http://localhost:5000/api` backend URL.

Install the server's existing dependencies with `npm install` inside `server`,
then start it with `npm run dev`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
