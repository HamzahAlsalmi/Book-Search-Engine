import React from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth.js";
import { removeBookId } from "../utils/localStorage";

// Define a type for Book
type Book = {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
};

const SavedBooks = () => {
  const { loading, error, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  if (loading) return <h2>LOADING...</h2>;
  if (error) return <h2>Error loading saved books.</h2>;

  const userData = data?.me || { savedBooks: [] }; // ✅ Ensure savedBooks exists

  const handleDeleteBook = async (bookId: string) => {
    try {
      await removeBook({
        variables: { bookId },
        update(cache, { data }) {
          const updatedUser = data?.removeBook;
          cache.writeQuery({
            query: GET_ME,
            data: { me: updatedUser },
          });
        },
      });

      // ✅ Remove book from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(", ")}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
