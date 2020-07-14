import { AUDIOCALL_DEFAULT_VALUES, AUDIOCALL_START_VALUES, AUDIO_NAMES, CARD_NUMBER, KEY_CODE, MAX_NUMBER } from './audiocall-default-values';
import { Component, HostListener, OnInit } from '@angular/core';

import { ApiService } from '../../../../../../shared/services/api.service';
import { AudioCallCard } from './audiocall-card.model';
import { AudioCallService } from './audiocall.service';
import { Config } from '../../../../../../common/config'
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-audiocall',
  templateUrl: './audiocall.component.html',
  styleUrls: ['./audiocall.component.scss',
    './audiocall-loader.scss'],
  providers: [AudioCallService]
})
export class AudiocallComponent implements OnInit {
  constructor(private audioCallService: AudioCallService, private urlConfig: Config, private apiService: ApiService,) {
    for (let i = 1; i < MAX_NUMBER.LEVEL; i++) {
      this.levels.push(i + 1);
    }
    for (let i = 0; i < MAX_NUMBER.PAGE; i++) {
      this.pages.push(i + 1);
    }
  }

  levels: number[] = [];
  pages: number[] = [];
  savannahCards: AudioCallCard[];
  remainGameCards: AudioCallCard[];
  activeCard: AudioCallCard;
  randomCards: AudioCallCard[];
  lives: number;
  rightWords: number;
  mistakesNumber: number;
  currentCheckedWordsNumber: number;
  mistakeWordsArray: string[] = [];
  rightWordsArray: string[] = [];
  livesArray: Array<number> = [];
  activeImagePath: string;

  isHiddenDescription = AUDIOCALL_DEFAULT_VALUES.isHiddenDescription;
  isHiddenLoader = AUDIOCALL_DEFAULT_VALUES.isHiddenLoader;
  isHiddenButton = AUDIOCALL_DEFAULT_VALUES.isHiddenButton;
  isHiddenStartScreen = AUDIOCALL_DEFAULT_VALUES.isHiddenStartScreen;
  isHiddenFinalScreen = AUDIOCALL_DEFAULT_VALUES.isHiddenFinalScreen;
  isAnimationStart = AUDIOCALL_DEFAULT_VALUES.isAnimationStart;
  isAnimationEnd = AUDIOCALL_DEFAULT_VALUES.isAnimationEnd;
  isAnimationBullet = AUDIOCALL_DEFAULT_VALUES.isAnimationBullet;
  isSoundSelected = AUDIOCALL_DEFAULT_VALUES.isSoundSelected;
  isNextWordButton = false;
  isSkipButton = true;
  isGameContainerAnimation = false;

  pageNumber: number = 0;
  wordsLevel: number = 0;

  totalErrorPercent: number;
  totalGamesNumber: number;

  title: string[] = 'SAVANAH'.split('').reverse();

  ngOnInit(): void { }

  getDefaultAdditionalGameValues(): void {
    this.isHiddenDescription = AUDIOCALL_START_VALUES.isHiddenDescription;
    this.isHiddenButton = AUDIOCALL_START_VALUES.isHiddenButton;
    this.isHiddenLoader = AUDIOCALL_START_VALUES.isHiddenLoader;
    this.mistakesNumber = AUDIOCALL_START_VALUES.mistakesNumber;
    this.currentCheckedWordsNumber = AUDIOCALL_START_VALUES.currentCheckedWordsNumber;
    this.rightWords = AUDIOCALL_START_VALUES.rightWords;
    this.isHiddenFinalScreen = AUDIOCALL_START_VALUES.isHiddenFinalScreen;
    this.isAnimationStart = AUDIOCALL_START_VALUES.isAnimationStart;
    this.lives = AUDIOCALL_START_VALUES.lives;
    this.fullLivesArray();
    this.mistakeWordsArray = [];
    this.rightWordsArray = [];
  }

  fullLivesArray(): void {
    for (let i = 1; i <= this.lives; i++) {
      this.livesArray.push(i);
    }
  }

  newLevel(event: { target: { value: number; }; }): void {
    this.pageNumber = event.target.value - 1;
  }

  newPage(event: { target: { value: number; }; }): void {
    this.wordsLevel = event.target.value - 1;
  }

  startGame(): void {
    this.getDefaultAdditionalGameValues();
    this.getUserStatistic();
    this.audioCallService
      .getWords(this.wordsLevel, this.pageNumber)
      .pipe(first()).subscribe((words) => {
        this.savannahCards = words;
        this.remainGameCards = [...this.savannahCards];
        this.getForeignWord();
      });
  }

  getForeignWord(): void {
    this.isHiddenLoader = true;
    this.isHiddenStartScreen = true;
    this.setActiveCard();
    this.randomCards = this.getThreeRandomCardsRandomNumbers(
      this.savannahCards
    );
    this.randomCards.push(this.activeCard);
  }


  fallingBlock: ReturnType<typeof setTimeout>;

  setActiveCard(): void {
    this.correctWordSelected = false;
    this.isGameContainerAnimation = false;

    const activeCardIndex: number = this.getRandomNumber(
      this.remainGameCards.length
    );

    this.activeCard = this.remainGameCards[activeCardIndex];
    this.soundForeignWord();
    // if (this.isSoundSelected) {
    //   this.soundForeignWord();
    // }

    // this.fallingBlock = setTimeout(() => {
    //   this.ifGuessTheWord();
    // }, 5000);
  }

  removeElementFromArray(array: AudioCallCard[], value: AudioCallCard) {
    const index: number = array.indexOf(value);
    array.splice(index, 1);
    return array;
  }

  getRandomNumber(maxValue: number): number {
    return Math.floor(Math.random() * Math.floor(maxValue));
  }

  getThreeRandomCardsRandomNumbers(
    cards: AudioCallCard[]
  ): AudioCallCard[] {
    const array = [...cards];
    const length = 4;
    const result = [];

    this.removeElementFromArray(array, this.activeCard);

    for (let i = 0; i < length; i++) {
      let index = this.getRandomNumber(array.length);
      let curCard = array[index];
      array.splice(index, 1);
      result.push(curCard);
    }

    return result;
  }

  checkResult(wordId: string): void {
    clearTimeout(this.fallingBlock);
    this.correctWordSelected = true;
    this.currentCheckedWordsNumber++;
    wordId === this.activeCard.wordId
      ? this.guessTheWord()
      : this.notGuessTheWord();
  }

  correctWordSelected: boolean = false;

  ifGuessTheWord(): void {
    if (!this.correctWordSelected) {
      this.notGuessTheWord();
    }
  }

  setNextWord(): void {
    // this. getActiveCardImage();
    this.rightWords === 20 ? this.gameOver() : this.getNextRandomCards();
    this.isNextWordButton = false;
    this.isSkipButton = true;
    this.activeImagePath = '';
    // this.isGameContainerAnimation = true;

    setTimeout(() => {
      this.isGameContainerAnimation = true;
    }, 1);
  }

  skipActiveWord(): void {
    // this.notGuessTheWord();
    this.livesArray.length === 0 ? this.gameOver() : this.getRandomCards();
    this.activeImagePath = '';
    // this.isSkipButton = false;
    // this.isNextWordButton = true;
  }

  notGuessTheWord(): void {
    this.audioPlay(AUDIO_NAMES.ERROR);
    this.mistakeWordsArray.push(`${this.activeCard.foreignWord} : ${this.activeCard.nativeWord}`);
    this.lives--;
    this.livesArray.splice(0, 1);
    // this.livesArray.length === 0 ? this.gameOver() : this.getRandomCards();
    this.isAnimationEnd = false;
    this.mistakesNumber++;
  }

  guessTheWord(): void {
    this.audioPlay(AUDIO_NAMES.CORRECT);
    this. getActiveCardImage();
    // this.isAnimationEnd = false;
    this.isNextWordButton = true;
    this.isSkipButton = false;
    this.rightWordsArray.push(`${this.activeCard.foreignWord} : ${this.activeCard.nativeWord}`);
    this.rightWords++;
    // this.rightWords === 20 ? this.gameOver() : this.getNextRandomCards();
  }

  soundForeignWord(): void {
    const audio = new Audio();

    audio.src = `${this.urlConfig.dataUrl()}${this.activeCard.audioUrl}`;
    audio.play();
    // this. getActiveCardImage();
  }

  getActiveCardImage(): void {
    // const image = new Image();
    this.activeImagePath = `${this.urlConfig.dataUrl()}${this.activeCard.imageUrl}`;
    // console.log('IMAGE', image.src);
  }

  getNextRandomCards(): void {
    this.removeElementFromArray(this.remainGameCards, this.activeCard);
    this.getRandomCards();
  }

  getRandomCards(): void {
    const randomActiveNativeWordPosition: number = this.getRandomNumber(
      this.randomCards.length
    );

    this.setActiveCard();
    this.randomCards = this.getThreeRandomCardsRandomNumbers(
      this.savannahCards
    );
    this.randomCards.splice(randomActiveNativeWordPosition, 0, this.activeCard);


    setTimeout(() => {
      this.isAnimationBullet = false;
    }, 1000);
  }

  audioPlay(name: string): void {
    if (name && this.isSoundSelected) {
      const audioSrc = '../../../../../../../assets/audio/savannah/';
      const audio = new Audio(`${audioSrc}${name}.mp3`);

      audio.play();
    }
  }

  selectSound(): void {
    this.isSoundSelected = !this.isSoundSelected;
  }

  nextLevel(): void {
    if (this.pageNumber < MAX_NUMBER.PAGE) {
      this.pageNumber++;
    } else if (this.wordsLevel < MAX_NUMBER.LEVEL) {
      this.pageNumber = 1;
      this.wordsLevel++;
    } else {
      this.wordsLevel = 1;
      this.pageNumber = 1;
    }
  }

  gameOver(): void {
    this.nextLevel();
    this.isHiddenFinalScreen = false;
    this.isHiddenStartScreen = false;
    this.isHiddenButton = false;
    this.activeCard = null;
    this.livesArray.length > 0
      ? this.audioPlay(AUDIO_NAMES.SUCCESS)
      : this.audioPlay(AUDIO_NAMES.FAILURE);

    this.setUserStatistic();
  }

  getUserStatistic(): void {
    this.apiService.getUserStatistics().subscribe((stats) => {
      this.totalErrorPercent = stats.optional.audiocall.errorRatePercent;
      this.totalGamesNumber = stats.optional.audiocall.totalGamesCompleted;
    });
  }

  setUserStatistic(): void {
    this.totalGamesNumber++;
    let countErrorsFromPercent: number = ((this.totalErrorPercent) * (this.currentCheckedWordsNumber * this.totalGamesNumber)) / 100;
    countErrorsFromPercent += this.mistakesNumber;
    this.totalErrorPercent = (countErrorsFromPercent * 100) / (this.currentCheckedWordsNumber * this.totalGamesNumber);
    this.apiService.updateUserStatistics({
      optional: {
        audiocall: {
          errorRatePercent: this.totalErrorPercent,
          totalGamesCompleted: this.totalGamesNumber,
        }
      }
    }).subscribe(res => {
      console.log(res.optional.audiocall)
    }, error => {
      console.log(error)
    });

  }

  ngOnDestroy(): void {
    clearTimeout(this.fallingBlock);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.activeCard) {
      switch (event.key) {
        case KEY_CODE.NUMBER_ONE.toString():
          this.checkResult(this.randomCards[CARD_NUMBER.FIRST].wordId);
          break;
        case KEY_CODE.NUMBER_TWO.toString():
          this.checkResult(this.randomCards[CARD_NUMBER.SECOND].wordId);
          break;
        case KEY_CODE.NUMBER_THREE.toString():
          this.checkResult(this.randomCards[CARD_NUMBER.THIRD].wordId);
          break;
        case KEY_CODE.NUMBER_FOUR.toString():
          this.checkResult(this.randomCards[CARD_NUMBER.FOURTH].wordId);
          break;
        case KEY_CODE.NUMBER_FIVE.toString():
          this.checkResult(this.randomCards[CARD_NUMBER.FIVES].wordId);
          break;
      }
    }
  }
}
