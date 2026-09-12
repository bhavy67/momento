import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsService } from '@core/services/events.service';
import { PeopleService } from '@core/services/people.service';
import { SettingsService } from '@core/services/settings.service';
import { SampleDataService } from '@core/services/sample-data.service';
import { UiStateService } from '@core/services/ui-state.service';
import {
  daysUntil, nextOccurrence, turningAge, yearsOnNextOccurrence,
  isMilestoneYear, milestoneLabel, onThisDayFilter,
  localDateToDate, formatCountdown, formatDate,
} from '@utils/dates';
import type { MomentoEvent, OnThisDayEntry, Person, UpcomingEvent } from '@types';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly eventsService = inject(EventsService);
  private readonly people        = inject(PeopleService);
  private readonly settings      = inject(SettingsService);
  private readonly sampleData    = inject(SampleDataService);
  private readonly ui            = inject(UiStateService);

  protected readonly loadingSample = signal(false);

  protected async loadSample(): Promise<void> {
    if (this.loadingSample()) return;
    this.loadingSample.set(true);
    try {
      await this.sampleData.load();
      this.ui.notify('Sample data loaded — explore away!', 'success');
    } catch {
      this.ui.notify('Failed to load sample data', 'error');
      this.loadingSample.set(false);
    }
  }

  protected readonly today = new Date();

  protected readonly greeting = this.computeGreeting();

  protected readonly todayLabel = formatDate(this.today, 'long');

  protected readonly windowDays = computed(() =>
    this.settings.settings().upcomingWindowDays
  );

  protected readonly allPeople = computed(() => this.people.all());
  protected readonly allEvents = computed(() => this.eventsService.all());

  protected readonly upcoming = computed((): UpcomingEvent[] => {
    const now    = this.today;
    const window = this.windowDays();
    const people = this.allPeople();

    return this.allEvents()
      .map(e => this.toUpcoming(e, people, now))
      .filter((u): u is UpcomingEvent => u !== null && u.daysUntil <= window)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  });

  protected readonly todayEvents = computed(() =>
    this.upcoming().filter(u => u.daysUntil === 0)
  );

  protected readonly soonEvents = computed(() =>
    this.upcoming().filter(u => u.daysUntil > 0)
  );

  protected readonly thisWeek  = computed(() => this.soonEvents().filter(u => u.daysUntil <= 7));
  protected readonly thisMonth = computed(() => this.soonEvents().filter(u => u.daysUntil > 7 && u.daysUntil <= 30));
  protected readonly later     = computed(() => this.soonEvents().filter(u => u.daysUntil > 30));

  protected readonly onThisDay = computed((): OnThisDayEntry[] => {
    const now    = this.today;
    const people = this.allPeople();
    return onThisDayFilter(this.allEvents(), now).map(e => ({
      event: e,
      person: e.personIds?.[0] ? people.find(p => p.id === e.personIds[0]) : undefined,
      yearsAgo: now.getFullYear() - e.date.year!,
      occurrenceDate: localDateToDate(e.date),
    }));
  });

  protected readonly isEmpty = computed(() =>
    this.allEvents().length === 0 && this.allPeople().length === 0
  );

  protected readonly formatCountdown = formatCountdown;

  protected typeIcon(type: string): string {
    const icons: Record<string, string> = {
      birthday: '🎂', anniversary: '♥', milestone: '✦', custom: '○',
    };
    return icons[type] ?? '○';
  }

  protected subtitleFor(u: UpcomingEvent): string {
    const parts: string[] = [];
    if (u.person) parts.push(u.person.name);
    if (u.milestoneLabel) parts.push(u.milestoneLabel);
    else if (u.age !== undefined)        parts.push(`Turning ${u.age}`);
    else if (u.yearsCount !== undefined) parts.push(`${u.yearsCount} year${u.yearsCount === 1 ? '' : 's'}`);
    return parts.join(' · ');
  }

  protected yearsAgoLabel(n: number): string {
    return n === 1 ? '1 year ago' : `${n} years ago`;
  }

  private toUpcoming(e: MomentoEvent, people: Person[], now: Date): UpcomingEvent | null {
    const next = nextOccurrence(e.date, e.recurrence.type, now);
    const days = daysUntil(next, now);

    // One-time events in the past are skipped
    if (e.recurrence.type === 'none' && days > 365) return null;

    const person        = e.personIds?.[0] ? people.find(p => p.id === e.personIds[0]) : undefined;
    const yearsCount    = yearsOnNextOccurrence(e.date, now) ?? undefined;
    const age           = (e.type === 'birthday' && person?.birthday)
                          ? (turningAge(person.birthday, now) ?? undefined)
                          : undefined;
    const isMs          = yearsCount !== undefined && isMilestoneYear(yearsCount);
    const msLabel       = isMs ? (milestoneLabel(yearsCount!) ?? undefined) : undefined;

    return { event: e, person, daysUntil: days, nextOccurrence: next, age, yearsCount, isMilestone: isMs, milestoneLabel: msLabel };
  }

  private computeGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }
}
