import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    apiKey: 'XzFEV1U0SUJGOEU4cmhKay0wM1k6SWJVQThSQ3hUeTZZQWFiUUI1Tmp4QQ==',
  },
  // auth: {
  //   username: "elastic",
  //   password: process.env.elasticsearch_password || "changeme",
  // },
  tls: { rejectUnauthorized: false },
})

export default client
