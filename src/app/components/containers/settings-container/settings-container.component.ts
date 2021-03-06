import {
  Component,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DisplayRate, ItemId, RecipeId, ResearchSpeed, Theme } from '~/models';
import { State } from '~/store';
import * as Dataset from '~/store/dataset';
import * as Settings from '~/store/settings';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'lab-settings-container',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsContainerComponent implements OnInit {
  @ViewChild(SettingsComponent) child: SettingsComponent;

  @Output() cancel = new EventEmitter();

  data$: Observable<Dataset.DatasetState>;
  settings$: Observable<Settings.SettingsState>;

  opening = true;

  constructor(private element: ElementRef, private store: Store<State>) {}

  ngOnInit() {
    this.data$ = this.store.select(Dataset.getDatasetState);
    this.settings$ = this.store.select(Settings.settingsState);
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent) {
    if (this.opening) {
      this.opening = false;
    } else if (!this.element.nativeElement.contains(event.target)) {
      this.cancel.emit();
    }
  }

  setDisplayRate(value: DisplayRate) {
    this.store.dispatch(new Settings.SetDisplayRateAction(value));
  }

  setItemPrecision(value: number) {
    this.store.dispatch(new Settings.SetItemPrecisionAction(value));
  }

  setBeltPrecision(value: number) {
    this.store.dispatch(new Settings.SetBeltPrecisionAction(value));
  }

  setFactoryPrecision(value: number) {
    this.store.dispatch(new Settings.SetFactoryPrecisionAction(value));
  }

  setBelt(value: ItemId) {
    this.store.dispatch(new Settings.SetBeltAction(value));
  }

  setAssembler(value: ItemId) {
    this.store.dispatch(new Settings.SetAssemblerAction(value));
  }

  setFurnace(value: ItemId) {
    this.store.dispatch(new Settings.SetFurnaceAction(value));
  }

  setOilRecipe(value: RecipeId) {
    this.store.dispatch(new Settings.SetOilRecipeAction(value));
  }

  setFuel(value: ItemId) {
    this.store.dispatch(new Settings.SetFuelAction(value));
  }

  setFlowRate(value: number) {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
  }

  setProdModule(value: ItemId) {
    this.store.dispatch(new Settings.SetProdModuleAction(value));
  }

  setSpeedModule(value: ItemId) {
    this.store.dispatch(new Settings.SetSpeedModuleAction(value));
  }

  setBeaconModule(value: ItemId) {
    this.store.dispatch(new Settings.SetBeaconModuleAction(value));
  }

  setBeaconCount(value: number) {
    this.store.dispatch(new Settings.SetBeaconCountAction(value));
  }

  setDrillModule(value: boolean) {
    this.store.dispatch(new Settings.SetDrillModuleAction(value));
  }

  setMiningBonus(value: number) {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed) {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setExpensive(value: boolean) {
    this.store.dispatch(new Settings.SetExpensiveAction(value));
  }

  setTheme(value: Theme) {
    this.store.dispatch(new Settings.SetTheme(value));
  }
}
