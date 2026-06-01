import app from './app';

const PORT = parseInt(process.env.PORT || '8080', 10);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});