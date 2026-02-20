import { mongoosastic } from 'mongoosastic-ts'
import mongoose, { model, Schema } from 'mongoose'
import { MongoosasticDocument, MongoosasticModel } from 'mongoosastic-ts/dist/types'
import client from '../util/elastic.client'

interface ITodo extends Document, MongoosasticDocument {
  title: string
  description: string
}

const TodoSchema = new Schema({
  title: { type: String, es_boost: 2.0 },
  description: { type: String },
})

// @ts-ignore
TodoSchema.plugin(mongoosastic, {
  esClient: client,
})

const Todo = model<typeof TodoSchema, MongoosasticModel<typeof TodoSchema>>('Todo', TodoSchema)

mongoose.connection
  .on('error', (err) => {
    console.error(err)
  })
  .on('open', (err) => {
    const stream = Todo.synchronize({}, { saveOnSynchronize: true })

    stream.on('data', function (err, doc) {})

    stream.on('error', function (err) {
      console.log(err)
    })
  })
export { ITodo, Todo }
