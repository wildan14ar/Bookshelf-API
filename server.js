const Hapi = require('@hapi/hapi');
const nanoid = require('nanoid');

// Inisialisasi server Hapi
const init = async () => {
    const server = Hapi.server({
        port: 9000,
        host: 'localhost',
    });

    // Data buku
    let books = [];

    // Menyimpan buku baru
    server.route({
        method: 'POST',
        path: '/books',
        handler: (request, h) => {
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            // Validasi properti name
            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku',
                }).code(400);
            }

            // Validasi properti readPage dan pageCount
            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
                }).code(400);
            }

            const id = nanoid.nanoid();
            const insertedAt = new Date().toISOString();
            const updatedAt = insertedAt;

            const newBook = {
                id,
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                finished: pageCount === readPage,
                reading,
                insertedAt,
                updatedAt,
            };

            books.push(newBook);

            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id,
                },
            }).code(201);
        },
    });


    // Mendapatkan seluruh buku dengan query parameters
    server.route({
        method: 'GET',
        path: '/books',
        handler: (request, h) => {
            const { name, reading, finished } = request.query;

            let filteredBooks = books;

            // Filter berdasarkan properti name
            if (name) {
                const keyword = name.toLowerCase();
                filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(keyword));
            }

            // Filter berdasarkan properti reading
            if (reading !== undefined) {
                const isReading = reading === '1';
                filteredBooks = filteredBooks.filter(book => book.reading === isReading);
            }

            // Filter berdasarkan properti finished
            if (finished !== undefined) {
                const isFinished = finished === '1';
                filteredBooks = filteredBooks.filter(book => book.finished === isFinished);
            }

            // Memfilter hanya properti id, name, dan publisher
            const filteredData = filteredBooks.map(book => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            }));

            return h.response({
                status: 'success',
                data: {
                    books: filteredData,
                },
            });
        },
    });



    // Menampilkan detail buku berdasarkan ID
    server.route({
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
            const book = books.find((book) => book.id === bookId);
            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan',
                }).code(404);
            }
            return h.response({
                status: 'success',
                data: {
                    book,
                },
            });
        },
    });


    // Mengubah data buku berdasarkan ID
    server.route({
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
            const {
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
            } = request.payload;

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku',
                }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
                }).code(400);
            }

            const bookIndex = books.findIndex((book) => book.id === bookId);
            if (bookIndex === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan',
                }).code(404);
            }

            const updatedAt = new Date().toISOString();
            books[bookIndex] = {
                ...books[bookIndex],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                updatedAt,
            };

            return h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui',
            });
        },
    });


    // Menghapus buku berdasarkan ID
    server.route({
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
            const bookIndex = books.findIndex((book) => book.id === bookId);
            if (bookIndex === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan',
                }).code(404);
            }
            books.splice(bookIndex, 1);
            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus',
            });
        },
    });


    // Menjalankan server
    await server.start();
    console.log('Server berjalan di', server.info.uri);
};

// Menangani kesalahan saat menjalankan server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

// Menjalankan server saat file ini dijalankan dengan perintah npm run start
init();
