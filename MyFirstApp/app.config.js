import 'dotenv/config';

export default {
  expo: {
    name: "MyApp",
    slug: "my-app",
    version: "1.0.0",
    extra: {
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    },
  },
};
