import { map, Observable, tap } from 'rxjs';
import { Component, createEffect, createSignal, For } from 'solid-js';
import { WPMMetricService } from './metric';


const App: Component<{ keyStrokes$: Observable<KeyboardEvent>, typeText: string }> = (props) => {

  const wpm = new WPMMetricService('wpm');
  const [keyPressed, setKeyPressed] = createSignal('');
  const [xCharPos, setxCharPos] = createSignal<number>();
  const [yCharPos, setyCharPos] = createSignal<number>(0);
  const [charList, setCharList] = createSignal([['']]);
  const [wpmList, setWpmList] = createSignal<number[]>([]);
  const [WPM, setWPM] = createSignal(0);

  const incXPos = () => setxCharPos((val) => {
    if (val === undefined) return 0;
    const incVal = val + 1;
    return (incVal) > props.typeText.length ? val : incVal;
  });
  const incYPos = () => setyCharPos((val) => {
    if (val === undefined) return 0;
    const incVal = val + 1;
    return (incVal) > props.typeText.length ? val : incVal;
  });

  const typed$ = props.keyStrokes$.pipe(
    map((x) => x.key),
    map((x) => x.toLowerCase() === 'enter' ? ' ' : x),
    tap((_x) => { 
      const xPos = xCharPos() === undefined ? 0 : xCharPos() as number;
      const yPos = yCharPos();
      const row = props.typeText.split('\n');

      if (!row[yPos]) return;
      if (_x === ' ') wpm.addMetric(Date.now());
      if (xPos < row[yPos].length) {
        incXPos();
      } else if (xPos === row[yPos].length) { 
        setxCharPos((_val) => 0);
        incYPos();
      } else {
        incYPos();
      }
      setWpmList((_wpm) => wpm.metrics.map((wpm1) => wpm1.value))
    })
  );
  typed$.subscribe( (typed: string) => {
    setKeyPressed((_val) => typed)
  });

  setCharList((_vals) => {
    const newCharList: string[][] = [];
    const row = props.typeText.split(/(?<=\n)/);
    row.forEach((row) => 
      newCharList.push(row.replaceAll('\n', String.fromCharCode(160))
                          .replaceAll(' ', String.fromCharCode(160))
                          .split('')
                      ))

    return newCharList;
  })

  
  createEffect(() => {
    const xPos = xCharPos() as number;
    const yPos = yCharPos();
    const currChar = document.getElementById(`character-${xPos}-${yPos}`);
    if (!currChar || currChar.style.color === 'white') return;
    if (keyPressed() === charList()[yPos][xPos]) 
      currChar.style.color = 'white';
    else 
      currChar.style.color = 'red';
  });

  createEffect(() => {
    const list = wpmList();
    const length = list.length;
    const firstType = list[0];
    const lastType = list[length-1];
    const totalTimeMin  = (lastType - firstType)/60000;
    setWPM((val) => length / (totalTimeMin))
  })

  return (
    <div class="flex flex-col w-screen h-screen bg-black">
      <div class="text-[#cccccc] m-auto text-5xl font-mono select-none">
        { WPM() }
        <div class="flex flex-col text-5xl"> 
          <For each={charList()} fallback={<div> No Typing Row </div>}>
            {(characterRow, yIndex) => 
            <div class="flex flex-row text-5xl" data-index={yIndex()}>
              <For each={characterRow} fallback={<div> No Characters </div>}>
                {(character, xIndex) => <div id={`character-${xIndex()}-${yIndex()}`} data-index={xIndex()}>{character}</div>}
              </For>
            </div>
            }
          </For>
        </div>
      </div>
    </div>
  );
};

export default App;
