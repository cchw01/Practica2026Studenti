import { Component, OnInit } from '@angular/core';

export interface Category {
  name: string;
  icon: string;
}

export interface Auction {
  title: string;
  currentBid: number;
  image: string;
  timeLeft: string;
  urgency: 'urgent' | 'medium' | 'safe';
}

@Component({
  selector: 'home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css'], 
})
export class HomePage implements OnInit {
  
  categories: Category[] = [
    { name: 'Jewelry', icon: 'diamond' },
    { name: 'Auto', icon: 'directions_car' },
    { name: 'Art & Collectibles', icon: 'palette' },
    { name: 'Electronics', icon: 'devices' },
    { name: 'Real Estate', icon: 'home' }
  ];

  
  auctions: Auction[] = [
    { title: 'BMW', currentBid: 100, image: 'assets/images/car.png', timeLeft: '02:45m', urgency: 'urgent' },
    { title: 'Gold Earrings', currentBid: 200, image: 'assets/images/cercei.jpeg', timeLeft: '01:12m', urgency: 'medium' },
    { title: 'Watch Patek Philippe', currentBid: 300, image: 'assets/images/ceas.jpeg', timeLeft: '04:21m', urgency: 'safe' },
    { title: 'Villa', currentBid: 400, image: 'assets/images/vila.jpeg', timeLeft: '00:30s', urgency: 'urgent' }
  ];

  ngOnInit(): void {}
}