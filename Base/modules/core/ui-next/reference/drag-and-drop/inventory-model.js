import { createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { createStore } from '../../../vendor/solid-js/store/dist/store.js';

const InventoryModel = () => {
  const [state, setState] = createStore({
    containers: [
      { id: "Bag1", maxCount: -1 },
      { id: "Bag2", maxCount: -1 },
      { id: "Slot1", maxCount: 1, alphaOnly: true },
      { id: "Slot2", maxCount: 1, alphaOnly: true },
      { id: "Slot3", maxCount: 1, alphaOnly: true },
      { id: "Extras", maxCount: 3 }
    ],
    items: [
      { id: "A", cid: "Bag1" },
      { id: "B", cid: "Slot2" },
      { id: "C", cid: "Extras" },
      { id: "D", cid: "Bag1" },
      { id: "E", cid: "Bag1" },
      { id: "F", cid: "Bag1" },
      { id: "1", cid: "Bag2" },
      { id: "3", cid: "Bag2" },
      { id: "4", cid: "Bag2" },
      { id: "5", cid: "Bag2" },
      { id: "6", cid: "Bag2" }
    ]
  });
  function contains(iid, cid) {
    const item = state.items.find((item2) => item2.id == iid);
    return item && item.cid == cid;
  }
  function canContain(iid, cid) {
    const container = state.containers.find((c) => c.id == cid);
    if (container == null) {
      return false;
    }
    if (container.maxCount != -1) {
      let count = 0;
      for (const item of state.items) {
        if (item.cid == cid) {
          count++;
        }
      }
      if (count >= container.maxCount) {
        return false;
      }
    }
    if (container.alphaOnly) {
      if (!Number.isNaN(parseInt(iid, 10))) {
        return false;
      }
    }
    return true;
  }
  function items(cid) {
    return state.items.filter((item) => item.cid == cid).map((item) => item.id);
  }
  function swapItems(aid, bid) {
    const itemA = state.items.find((item) => item.id == aid);
    const itemB = state.items.find((item) => item.id == bid);
    if (itemA == null || itemB == null) {
      return;
    }
    if (itemA.cid == itemB.cid) {
      return;
    }
    const containerA = itemA.cid;
    const containerB = itemB.cid;
    if (!canContain(aid, containerB) || !canContain(bid, containerA)) {
      return;
    }
    setState("items", (item) => item.id == aid, "cid", containerB);
    setState("items", (item) => item.id == bid, "cid", containerA);
  }
  function equipItem(iid, cid) {
    const item = state.items.find((item2) => item2.id == iid);
    const container = state.containers.find((c) => c.id == cid);
    if (item == null) {
      return;
    }
    if (container == null) {
      return;
    }
    if (item.cid == cid) {
      return;
    }
    if (!canContain(iid, cid)) {
      return;
    }
    setState("items", (item2) => item2.id == iid, "cid", cid);
  }
  function unEquipItem(iid) {
    const item = state.items.find((item2) => item2.id == iid);
    if (item == null) {
      return;
    }
    if (item.cid == "Bag1" || item.cid == "Bag2") {
      return;
    }
    let bag1Count = 0;
    let bag2Count = 0;
    for (const item2 of state.items) {
      if (item2.cid == "Bag1") {
        bag1Count++;
      } else if (item2.cid == "Bag2") {
        bag2Count++;
      }
    }
    setState("items", (item2) => item2.id == iid, "cid", bag1Count > bag2Count ? "Bag2" : "Bag1");
  }
  function canAutoSlotItem(iid) {
    const item = state.items.find((e) => e.id == iid);
    if (item) {
      const slotIds = ["Slot1", "Slot2", "Slot3"];
      if (slotIds.includes(item.cid)) {
        return false;
      }
      for (const cid of slotIds) {
        if (state.items.every((e) => e.cid != cid) && canContain(iid, cid)) {
          return true;
        }
      }
    }
    return false;
  }
  function autoSlotItem(iid) {
    const item = state.items.find((e) => e.id == iid);
    if (item) {
      const slotIds = ["Slot1", "Slot2", "Slot3"];
      if (slotIds.includes(item.cid)) {
        return;
      }
      for (const cid of slotIds) {
        if (state.items.every((e) => e.cid != cid) && canContain(iid, cid)) {
          equipItem(iid, cid);
          return;
        }
      }
    }
  }
  return {
    state,
    setState,
    contains,
    canContain,
    items,
    swapItems,
    equipItem,
    unEquipItem,
    canAutoSlotItem,
    autoSlotItem
  };
};
const InventoryModelContext = createContext(InventoryModel());
const useInventoryModel = () => useContext(InventoryModelContext);

export { InventoryModelContext, useInventoryModel };
//# sourceMappingURL=inventory-model.js.map
