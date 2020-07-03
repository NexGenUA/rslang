import { Component, EventEmitter, Input, Output } from '@angular/core';
import { timer } from 'rxjs';
import { ScrollService } from '../../shared/services/scroll.service';
import { StatsWords } from '../../shared/interfaces';

@Component({
  selector: 'app-games-stats',
  templateUrl: './games-stats.component.html',
  styleUrls: ['./games-stats.component.scss']
})
export class GamesStatsComponent {
  @Output() hideStats = new EventEmitter();
  @Input() statistics: StatsWords[];

  isHideStats = false;

  constructor(private scroll: ScrollService) {
  }

  close(repairGame: StatsWords = null) {
    this.scroll.on();
    this.isHideStats = true;
    timer(350)
      .subscribe(() => {
        this.hideStats.emit(repairGame);
      });
  }
}
