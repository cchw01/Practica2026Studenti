import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  bmw = { title: 'BMW', currentBid: 100, image: 'assets/images/car.png', timeLeft: '02:45m' };
  earrings = { title: 'Gold Earrings', currentBid: 200, image: 'assets/images/cercei.jpeg', timeLeft: '01:12m' };
  watch = { title: 'Watch Patek Philippe', currentBid: 300, image: 'assets/images/ceas.jpeg', timeLeft: '04:21m' };
  villa = { title: 'Villa', currentBid: 400, image: 'assets/images/vila.jpeg', timeLeft: '00:30s' };

  ngOnInit(): void {
    
  }
}