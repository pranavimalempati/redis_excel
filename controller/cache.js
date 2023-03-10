const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createClient } = require('redis')
// const {uploadfile} = require('./controller')
const client = createClient();
const redisConnect = async () => {
  try {
   
    await client.connect();
    return { status: "success", response: client, message: null };
  } catch (err) {
    console.log(err);
    return {
      status: "fail",
      response: null,
      message: err.message,
    };
  }
};

 async function initCache() {
  try {
    await (await redisConnect()).response?.flushAll()
  } catch(err)  {
    console.log(err)
    return {status: "FAIL", response: null, message: err.message}
  }
}
  async function createRecordKey(record,key) {
    try {
      if(key === 'PROJECT#'){
        if(record.name) {
          key+="NAME:"+record.name+'#'
        }
         if(record.email) {
          key+="EMAIL:"+record.email+'#'
        }
        console.log(key)
      } else if(key === '*'){
         if(record.name) {
          key+="NAME:"+record.name+'*'
        }
         if(record.email) {
          key+="EMAIL:"+record.email+'*'
        }
        console.log(key)
      }
      return {status:"SUCCESS", key: key};
  } catch(err) {
    console.log(err)
    return {status: "FAIL", key: null}
  }
}

module.exports = {
    initCache,
    redisConnect,
    createRecordKey,
    client
};
  