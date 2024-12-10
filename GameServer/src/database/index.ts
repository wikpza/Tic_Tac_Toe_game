import mongoose from 'mongoose';

export default function connectDB() {

    // const url = `mongodb://${process.env["MONGO_INITDB_ROOT_USERNAME"] }:${process.env["MONGO_INITDB_ROOT_PASSWORD"]}@localhost:27017/${process.env["MONGO_INITDB_DATABASE"]}`;
    const url = "mongodb+srv://wikpza:1234567890ASDasd@cluster0.029tn7k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    mongoose.connect(url)
        .then(() => {
            console.log(`Database connected: ${url}`);
        })
        .catch(err => {
            console.error(`Connection error: ${err}`);
            process.exit(1);
        });

    // Обработка событий подключения
    const dbConnection = mongoose.connection;

    dbConnection.on('error', (err) => {
        console.error(`Database connection error: ${err}`);
    });

    dbConnection.once('open', () => {
        console.log(`Database connection established: ${url}`);
    });
}
