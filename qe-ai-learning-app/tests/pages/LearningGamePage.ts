import { expect, type Page } from '@playwright/test';
import { course } from '../../client/src/content/course';
import type { Progress } from '../../client/src/services/progress';

/** Reuse navigation and answer mechanics; assertions about learning remain in tests. */
export class LearningGamePage {
  constructor(readonly page: Page) {}

  async open(progress?: Progress) {
    if (progress) {
      await this.page.addInitScript((saved) => {
        if (!localStorage.getItem('qe-ai-learning:v1')) localStorage.setItem('qe-ai-learning:v1', JSON.stringify(saved));
      }, progress);
    }
    await this.page.goto('/');
  }

  async openFinal() {
    await this.page.getByRole('button', { name: 'Open final exam', exact: true }).click();
  }

  async answerFinal(correctIds: string[]) {
    const exam = this.page.getByRole('region', { name: 'Final exam', exact: true });
    for (const [index, question] of course.finalExamQuestions.entries()) {
      const answer = correctIds.includes(question.id) ? question.answerIndex : (question.answerIndex + 1) % question.options.length;
      await exam.getByRole('group').nth(index).getByRole('radio').nth(answer).check();
    }
  }

  async resultText() {
    const result = this.page.getByRole('region', { name: 'Final exam', exact: true }).getByRole('status');
    await expect(result).toBeVisible();
    return result;
  }
}
