const mongoose  = require('mongoose')

/*
There are two classes of errors that can occur with a Mongoose connection.

Error on initial connection. If initial connection fails, Mongoose will emit an 'error' event and 
the promise mongoose.connect() returns reject. However, Mongoose will not automatically try to reconnect.

Error after initial connection was established. Mongoose will attempt to reconnect, and it will emit an 'error' event.

To handle initial connection errors, you should use .catch() or try/catch with async/await.
*/

const connectDB=async () => {
    try {
        /*
        You can connect to MongoDB with the mongoose.connect() method.
        */
        const conn= await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
      useUnifiedTopology: true
        })
         console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    process.exit();
    }
}
/*
To handle errors after initial connection was established, you should listen for error events on the connection.
Note that Mongoose does not necessarily emit an 'error' event if it loses connectivity to MongoDB. 
You should listen to the disconnected event to report when Mongoose is disconnected from MongoDB.
*/
mongoose.connection.on('error', err => {
  logError(err);
});

/*
Emitted when Mongoose lost connection to the MongoDB server. 
This event may be due to the database server crashing, or network connectivity issues.
*/
mongoose.connection.on('disconnected',()=>{
    console.log('disconnected!!')
})

/*
Emitted when Mongoose successfully makes its initial connection to the MongoDB server, 
or when Mongoose reconnects after losing connectivity. 
May be emitted multiple times if Mongoose loses connectivity.
*/
mongoose.connection.on('connected',()=>{
    console.log('connected!!!!')
})


module.exports = connectDB