import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Dataset } from '../../types';
import Provenance from '../../components/Provenance';
import { freshProgress, generateQuestions, restoreProgress, scoreProgress, serializeProgress, STORAGE_KEY } from './questions';
import type { Progress, Question } from './questions';
import './challenges.css';

export default function Challenges({ dataset }: { dataset: Dataset }) {
  const questions = useMemo(() => generateQuestions(dataset), [dataset]);
  return <ChallengeSession key={dataset.version} dataset={dataset} questions={questions} />;
}
function ChallengeSession({ dataset, questions }: { dataset: Dataset; questions: Question[] }) {
  const titleId = useId();
  const feedbackId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [progress, setProgress] = useState<Progress>(() => {
    try { return restoreProgress(window.localStorage.getItem(STORAGE_KEY), dataset, questions); }
    catch { return freshProgress(questions); }
  });
  const previousCursor = useRef(progress.cursor);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, serializeProgress(dataset, questions, progress)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
    if (previousCursor.current !== progress.cursor) heading.current?.focus();
    previousCursor.current = progress.cursor;
  }, [dataset, questions, progress]);
  const question = questions[progress.cursor];
  const selected = progress.answers[progress.cursor];
  const answered = selected !== null && selected !== undefined;
  const score = scoreProgress(questions, progress);
  const answeredCount = progress.answers.filter(answer => answer !== null).length;
  const complete = questions.length > 0 && progress.cursor === questions.length;
  function answer(index: number) {
    setProgress(current => {
      if (current.answers[current.cursor] !== null) return current;
      return { ...current, answers: current.answers.map((value, i) => i === current.cursor ? index : value) };
    });
  }
  function reset() { setProgress(freshProgress(questions)); heading.current?.focus(); }
  return <section id="challenges" className="challenges-panel" aria-labelledby={titleId}>
    <div className="challenges-header"><div><p className="challenges-eyebrow">PUT THE PATTERNS TO WORK</p><h2 id={titleId}>Chemistry challenges</h2></div><span className="challenges-badge">High school · {questions.length} questions</span></div>
    <p className="challenges-intro">From atomic number to electron shells. Think it through, use a hint, then check the science behind each answer.</p>
    <div className="challenges-status"><span>{complete ? 'Practice complete' : `${answeredCount} of ${questions.length} answered`}</span><strong>Score {score} / {answeredCount}</strong></div>
    <progress className="challenges-progress" value={answeredCount} max={questions.length || 1} aria-label={`${answeredCount} of ${questions.length} questions answered`} />
    {!questions.length ? <p role="status">These activities need source-linked element and isotope records that are unavailable in this snapshot.</p> : complete ? <div className="challenges-complete">
      <span className="challenges-complete-mark" aria-hidden="true">✓</span><p className="challenges-eyebrow">PRACTICE COMPLETE</p><h3 ref={heading} tabIndex={-1}>You scored {score} out of {questions.length}.</h3><p>Every answer is a chance to connect the table, the nucleus, and the electron model. Restart to revisit the same questions.</p>
      <button className="challenges-primary" type="button" onClick={reset}>Practice again <span aria-hidden="true">↻</span></button>
      <Provenance dataset={dataset} sourceIds={[...new Set(questions.flatMap(q => q.sourceIds))]} />
    </div> : question && <div className="challenges-question">
      <div className="challenges-question-meta"><span>QUESTION {progress.cursor + 1} / {questions.length}</span><span>{question.kind} · {question.objective}</span></div>
      <h3 ref={heading} tabIndex={-1}>{question.prompt}</h3>
      <fieldset className="challenges-answers" disabled={answered}><legend className="challenges-sr-only">Choose one answer</legend>{question.answers.map((option, index) => {
        const correct = answered && index === question.correctIndex;
        const incorrect = answered && index === selected && !correct;
        return <button className={`challenges-answer${correct ? ' is-correct' : ''}${incorrect ? ' is-incorrect' : ''}`} key={option.text} type="button" onClick={() => answer(index)}><span className="challenges-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>{correct && <span className="challenges-answer-result">✓ Correct</span>}{incorrect && <span className="challenges-answer-result">Your answer</span>}</button>;
      })}</fieldset>
      {!answered && <div className="challenges-hints"><button type="button" className="challenges-hint-button" disabled={progress.hints[progress.cursor] >= question.hints.length} onClick={() => setProgress(current => ({ ...current, hints: current.hints.map((value, i) => i === current.cursor ? Math.min(value + 1, question.hints.length) : value) }))}>{progress.hints[progress.cursor] ? 'Reveal another hint' : 'Need a hint?'} <span>({progress.hints[progress.cursor]} / {question.hints.length})</span></button><div aria-live="polite">{question.hints.slice(0, progress.hints[progress.cursor]).map((hint, i) => <p key={hint}><strong>Hint {i + 1}.</strong> {hint}</p>)}</div></div>}
      <div aria-live="polite" aria-atomic="true" id={feedbackId}>{answered && <div className={`challenges-feedback${selected === question.correctIndex ? ' is-correct' : ''}`}><h4>{selected === question.correctIndex ? 'Correct — nicely reasoned.' : 'Keep going — here’s the connection.'}</h4><p>{question.answers[selected].feedback}</p><p><strong>Answer: {question.answers[question.correctIndex].text}.</strong> {question.explanation}</p></div>}</div>
      {answered && <><Provenance dataset={dataset} sourceIds={question.sourceIds} /><p className="challenges-records">Supporting records: {question.recordIds.join(' · ')}</p><button className="challenges-primary challenges-next" type="button" onClick={() => setProgress(current => current.cursor < questions.length && current.answers[current.cursor] !== null ? { ...current, cursor: current.cursor + 1 } : current)}>{progress.cursor === questions.length - 1 ? 'See my result' : 'Next question'} <span aria-hidden="true">→</span></button></>}
    </div>}
    <div className="challenges-footer"><span>{storageAvailable ? 'Progress stays in this browser. Hints do not reduce your score.' : 'Browser storage is unavailable. Progress lasts for this visit.'}</span>{!complete && questions.length > 0 && <button type="button" onClick={reset}>Reset progress</button>}</div>
  </section>;
}
