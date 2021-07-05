import { Component, OnInit } from '@angular/core';


declare var $: any;


@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
  styleUrls: ['./app.component.css', "./login/login.component.css"]
})
export class AppComponent implements OnInit {
  pageTitle: string = 'URBO';

  
  constructor() {}
  
  ngOnInit() {
  }
   
}
