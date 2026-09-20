import { TestBed } from '@angular/core/testing';
import { ConfiguratorStore } from './configurator.store';
import { SelectedAddons } from './selected-addons';

describe('shared selected addons panel', () => {
  it('renders only selected tiles through additions, removals and industry changes', () => {
    const store = TestBed.inject(ConfiguratorStore);
    const fixture = TestBed.createComponent(SelectedAddons);
    const render = () => {
      fixture.componentRef.setInput('addons', store.selectedAddons());
      fixture.componentRef.setInput('activeId', store.activeAddonId());
      fixture.detectChanges();
      return Array.from(
        fixture.nativeElement.querySelectorAll('.tile') as NodeListOf<HTMLElement>,
      ).map((tile) => tile.textContent!.trim());
    };
    expect(render()).toEqual([]);
    for (const industry of store.industries) {
      store.selectIndustry(industry.id);
      expect(render()).toEqual([]);
      // Select out of order: display order remains the same as the left cards.
      for (const item of [...industry.addons].reverse()) {
        store.toggleAddon(item.id);
        expect(render()).toEqual(store.selectedAddons().map((addon) => addon.shortLabel));
        expect(fixture.nativeElement.querySelectorAll('.active')).toHaveLength(1);
      }
      for (const item of industry.addons) {
        store.toggleAddon(item.id);
        expect(render()).toEqual(store.selectedAddons().map((addon) => addon.shortLabel));
      }
      store.toggleAddon(industry.addons[0].id);
      render();
    }
    store.restart();
    expect(render()).toEqual([]);
    fixture.destroy();
  });
});
