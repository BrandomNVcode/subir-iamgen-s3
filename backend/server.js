const express = require('express')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const { uploadFile, getFileStream, deleteFile } = require('./s3')

const app = express()

app.get('/images/:key', (req, res) => {
  console.log(req.params)
  const key = req.params.key
  const readStream = getFileStream(key)

  readStream.pipe(res)
})


// POSTMAN: https://prnt.sc/TRQIHAgeLLXU
app.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  console.log(file)

  // apply filter
  // resize 

  const result = await uploadFile(file)
  await unlinkFile(file.path)
  console.log(result)
  const description = req.body.description
  res.send({imagePath: `/images/${result.Key}`})
})


app.delete('/delete/:key', async(req, res) => {
  const { key } = req.params;
  try {
    console.log('KEY', key)
    const resp = await deleteFile(key);
    
    return res.json({
      ok: true,
      resp
    })

  } catch (error) {
    console.log('ERROR', error)
    return res.json({
      ok: false,
      msj: 'Error al eliminar',
      error
    })
  }
})



app.listen(8080, () => console.log("listening on port 8080"))