import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  // --- PROPERTIES ---
  title = 'booksapp';
  readonly APIUrl = "http://localhost:5038/api/books/";

  books: any = [];
  isEditMode: boolean = false;

  // Form Model
  currentBook: any = {
    id: null,
    title: '',
    description: '',
    price: '',
    author: '',
    year: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.refreshBooks();
  }

  refreshBooks() {
    this.http.get(this.APIUrl + 'GetBooks').subscribe(data => {
      this.books = data;
    });
  }

  saveBook() {
    var formData = new FormData();
    formData.append("title", this.currentBook.title);
    formData.append("description", this.currentBook.description);
    formData.append("price", this.currentBook.price.toString());
    formData.append("author", this.currentBook.author);
    formData.append("year", this.currentBook.year.toString());

    if (this.isEditMode) {
      // UPDATE Logic
      this.http.put(`${this.APIUrl}UpdateBook?id=${this.currentBook.id}`, formData).subscribe(res => {
        alert(res);
        this.cancelEdit();
        this.refreshBooks();
      });
    } else {
      // ADD Logic
      this.http.post(this.APIUrl + 'AddBook', formData).subscribe(res => {
        alert(res);
        this.cancelEdit();
        this.refreshBooks();
      });
    }
  }

  deleteBook(id: any) {
    if(confirm("Delete this book?")) {
      this.http.delete(this.APIUrl + 'DeleteBook?id=' + id).subscribe(res => {
        alert(res);
        this.refreshBooks();
      });
    }
  }

  // --- UI STATE MANAGEMENT ---
  editBook(book: any) {
    this.isEditMode = true;

    this.currentBook = { ...book };
  }

  cancelEdit() {
    this.isEditMode = false;
    this.currentBook = {
      id: null,
      title: '',
      description: '',
      price: '',
      author: '',
      year: ''
    };
  }
}
