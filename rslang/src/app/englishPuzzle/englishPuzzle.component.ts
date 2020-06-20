import { Component, OnInit } from '@angular/core';
import { WordsService } from './words.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-english-puzzle',
  templateUrl: './englishPuzzle.component.html',
  styleUrls: ['./englishPuzzle.component.scss'],
})
export class EnglishPuzzleComponent implements OnInit {
  levels: number[] = [];
  pages: number[] = [];
  constructor(private wordsService: WordsService) {
    const levelsNumber = 6;
    const pagesNumber = 60;
    for (let i = 0; i < levelsNumber; i++) {
      this.levels.push(i + 1);
    }
    for (let i = 0; i < pagesNumber; i++) {
      this.pages.push(i + 1);
    }
  }

  answers: string[] = [];
  words: object[] = [];
  currentWordNumber = 0;
  numberOfLetters: number;
  currentTextExample: string;
  currentSplittedTextExample: string[];
  currentAnswer: string[] = [];
  ngOnInit() {
    this.wordsService.getWords().subscribe((data: object[]) => {
      this.words = data;
      this.currentTextExample = this.getCurrentTextExample();
      this.numberOfLetters = this.currentTextExample.replace(/ /g, '').length;
      this.currentSplittedTextExample = this.currentTextExample.split(' ');
      return this.words;
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  newLine() {
    if (this.currentAnswer.join(' ') === this.currentTextExample) {
      this.answers.push(this.currentTextExample);
    }
    this.currentAnswer = [];
    this.currentWordNumber++;
    this.currentTextExample = this.getCurrentTextExample();
    this.numberOfLetters = this.currentTextExample.replace(/ /g, '').length;
    this.currentSplittedTextExample = this.currentTextExample.split(' ');
  }

  getCurrentTextExample(): string {
    return this.words[this.currentWordNumber]['textExample'].replace(
      /<.?.?.?>/g,
      ''
    );
  }

  toBottom(text) {
    const index = this.currentAnswer.indexOf(text);
    if (index !== -1) {
      this.currentAnswer.splice(index, 1);
      this.currentSplittedTextExample.push(text);
    }
  }

  toUp(text) {
    const index = this.currentSplittedTextExample.indexOf(text);
    if (index !== -1) {
      this.currentSplittedTextExample.splice(index, 1);
      this.currentAnswer.push(text);
    }
  }
}