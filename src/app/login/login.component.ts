import { HttpClient } from '@angular/common/http';
import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup | undefined;

  constructor(private http: HttpClient, private router:Router) {}

  ngOnInit(): void {}

  clickLogin() {
    let username = (<HTMLInputElement>document.getElementById('email')).value;
    let password = (<HTMLInputElement>document.getElementById('password'))
      .value;

    this.http
      .post('/api/login', {
        login: {
          username: username,
          password: password,
        },
      })
      .subscribe(
        (response:any) => {

          console.log(response);
          localStorage.setItem('token', response['token']);
          this.router.navigateByUrl('/welcome-page');
        },
        (error) => {
          console.error(error);
        }
      );

    //  if(email == "ooana412@yahoo.com" && password == "parola") {
    //   console.log("merge");
    //   window.location.href = "http://localhost:4200/map";
    // } else console.log("Nu merge");

    // fetch('/api/login', {
    //   method: 'post',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     login: {
    //       username: username,
    //       password: password,
    //     },
    //   }),
    // });
  }

  // test() {
  //   this.http
  //     .get('/api/test', {
  //       headers: {
  //         authorization:
  //           'Bearer ' +
  //           localStorage.getItem('token'),
  //       },
  //     })
  //     .subscribe(
  //       (response) => {
  //         console.log(response);
  //       },
  //       (error) => {
  //         console.error(error);
  //       }
  //     );
  // }
}
