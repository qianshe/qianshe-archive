/**
 * 用户交互测试工具
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('User Interaction Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Mouse Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();

      const button = document.createElement('button');
      button.textContent = 'Click me';
      button.onclick = handleClick;

      document.body.appendChild(button);

      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle double click events', async () => {
      const handleDoubleClick = vi.fn();

      const div = document.createElement('div');
      div.textContent = 'Double click me';
      div.ondblclick = handleDoubleClick;

      document.body.appendChild(div);

      await user.dblClick(div);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle right click events', async () => {
      const handleContextMenu = vi.fn();

      const div = document.createElement('div');
      div.textContent = 'Right click me';
      div.oncontextmenu = handleContextMenu;

      document.body.appendChild(div);

      await user.pointer([{ keys: '[MouseRight]', target: div }]);

      expect(handleContextMenu).toHaveBeenCalledTimes(1);
    });

    it('should handle hover events', async () => {
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();

      const div = document.createElement('div');
      div.textContent = 'Hover me';
      div.onmouseenter = handleMouseEnter;
      div.onmouseleave = handleMouseLeave;

      document.body.appendChild(div);

      await user.hover(div);
      await user.unhover(div);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should handle drag and drop', async () => {
      const handleDragStart = vi.fn();
      const handleDragOver = vi.fn();
      const handleDrop = vi.fn();

      const draggable = document.createElement('div');
      draggable.draggable = true;
      draggable.textContent = 'Drag me';
      draggable.ondragstart = handleDragStart;

      const dropzone = document.createElement('div');
      dropzone.textContent = 'Drop here';
      dropzone.ondragover = handleDragOver;
      dropzone.ondrop = handleDrop;

      document.body.appendChild(draggable);
      document.body.appendChild(dropzone);

      await user.pointer([{ keys: '[MouseLeft>]', target: draggable }, { target: dropzone }]);

      expect(handleDragStart).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('should handle keyboard input', async () => {
      const handleInput = vi.fn();

      const input = document.createElement('input');
      input.placeholder = 'Type here';
      input.oninput = handleInput;

      document.body.appendChild(input);

      await user.type(input, 'Hello World');

      expect(input.value).toBe('Hello World');
      expect(handleInput).toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      const handleKeyDown = vi.fn();

      const input = document.createElement('input');
      input.onkeydown = handleKeyDown;

      document.body.appendChild(input);

      input.focus();
      await user.keyboard('[Tab]');
      await user.keyboard('[Enter]');
      await user.keyboard('[Escape]');

      expect(handleKeyDown).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard shortcuts', async () => {
      const handleKeyDown = vi.fn();

      const div = document.createElement('div');
      div.tabIndex = 0;
      div.onkeydown = handleKeyDown;
      div.textContent = 'Focus me and press Ctrl+S';

      document.body.appendChild(div);

      div.focus();
      await user.keyboard('[ControlLeft>][KeyS][/ControlLeft]');

      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('should handle special keys', async () => {
      const input = document.createElement('input');
      input.value = 'some text';

      document.body.appendChild(input);

      input.focus();

      // Select all
      await user.keyboard('[ControlLeft>][KeyA][/ControlLeft]');
      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(input.value.length);

      // Delete
      await user.keyboard('[Delete]');
      expect(input.value).toBe('some tex');

      // Backspace
      await user.keyboard('[Backspace]');
      expect(input.value).toBe('some te');
    });

    it('should handle form submission with Enter', async () => {
      const handleSubmit = vi.fn(e => e.preventDefault());

      const form = document.createElement('form');
      form.onsubmit = handleSubmit;

      const input = document.createElement('input');
      input.name = 'test';
      input.value = 'test value';

      form.appendChild(input);
      document.body.appendChild(form);

      input.focus();
      await user.keyboard('[Enter]');

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Touch Interactions', () => {
    beforeEach(() => {
      // Mock touch events
      Object.defineProperty(window, 'ontouchstart', {
        writable: true,
        value: null
      });

      // Mock touch points
      const createTouchList = (touches: Array<{ x: number; y: number }>) =>
        ({
          length: touches.length,
          item: (index: number) => touches[index],
          identifiedTouch: () => null
        }) as any;

      Object.defineProperty(window, 'TouchList', {
        writable: true,
        value: createTouchList
      });
    });

    it('should handle tap events', async () => {
      const handleTouchStart = vi.fn();
      const handleTouchEnd = vi.fn();

      const div = document.createElement('div');
      div.textContent = 'Tap me';
      div.ontouchstart = handleTouchStart;
      div.ontouchend = handleTouchEnd;

      document.body.appendChild(div);

      await user.pointer([
        { keys: '[TouchA]', target: div },
        { keys: '[/TouchA]', target: div }
      ]);

      expect(handleTouchStart).toHaveBeenCalled();
      expect(handleTouchEnd).toHaveBeenCalled();
    });

    it('should handle swipe gestures', async () => {
      const handleTouchStart = vi.fn();
      const handleTouchMove = vi.fn();
      const handleTouchEnd = vi.fn();

      const div = document.createElement('div');
      div.style.width = '200px';
      div.style.height = '100px';
      div.textContent = 'Swipe me';
      div.ontouchstart = handleTouchStart;
      div.ontouchmove = handleTouchMove;
      div.ontouchend = handleTouchEnd;

      document.body.appendChild(div);

      // Simulate swipe from left to right
      await user.pointer([
        { keys: '[TouchA]', target: div, coords: { x: 10, y: 50 } },
        { pointerName: 'touch', target: div, coords: { x: 150, y: 50 } },
        { keys: '[/TouchA]', target: div, coords: { x: 150, y: 50 } }
      ]);

      expect(handleTouchStart).toHaveBeenCalled();
      expect(handleTouchMove).toHaveBeenCalled();
      expect(handleTouchEnd).toHaveBeenCalled();
    });

    it('should handle pinch gestures', async () => {
      const handleTouchStart = vi.fn();
      const handleTouchMove = vi.fn();

      const div = document.createElement('div');
      div.style.width = '200px';
      div.style.height = '200px';
      div.textContent = 'Pinch me';
      div.ontouchstart = handleTouchStart;
      div.ontouchmove = handleTouchMove;

      document.body.appendChild(div);

      // Simulate pinch gesture (two touch points moving apart)
      await user.pointer([
        { keys: '[TouchA]', target: div, coords: { x: 80, y: 100 } },
        { keys: '[TouchB]', target: div, coords: { x: 120, y: 100 } },
        { pointerName: 'touch', target: div, coords: { x: 60, y: 100 } },
        { pointerName: 'touch', target: div, coords: { x: 140, y: 100 } },
        { keys: '[/TouchB]', target: div },
        { keys: '[/TouchA]', target: div }
      ]);

      expect(handleTouchStart).toHaveBeenCalled();
      expect(handleTouchMove).toHaveBeenCalled();
    });
  });

  describe('Form Interactions', () => {
    it('should handle checkbox interactions', async () => {
      const handleChange = vi.fn();

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'test-checkbox';
      checkbox.onchange = handleChange;

      const label = document.createElement('label');
      label.htmlFor = 'test-checkbox';
      label.textContent = 'Check me';

      document.body.appendChild(checkbox);
      document.body.appendChild(label);

      await user.click(checkbox);

      expect(checkbox.checked).toBe(true);
      expect(handleChange).toHaveBeenCalled();

      await user.click(checkbox);

      expect(checkbox.checked).toBe(false);
    });

    it('should handle radio button interactions', async () => {
      const handleChange = vi.fn();

      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'test-radio';
      radio1.value = 'option1';
      radio1.id = 'radio1';
      radio1.onchange = handleChange;

      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = 'test-radio';
      radio2.value = 'option2';
      radio2.id = 'radio2';
      radio2.onchange = handleChange;

      const label1 = document.createElement('label');
      label1.htmlFor = 'radio1';
      label1.textContent = 'Option 1';

      const label2 = document.createElement('label');
      label2.htmlFor = 'radio2';
      label2.textContent = 'Option 2';

      document.body.appendChild(radio1);
      document.body.appendChild(label1);
      document.body.appendChild(radio2);
      document.body.appendChild(label2);

      await user.click(label1);

      expect(radio1.checked).toBe(true);
      expect(radio2.checked).toBe(false);

      await user.click(label2);

      expect(radio1.checked).toBe(false);
      expect(radio2.checked).toBe(true);
    });

    it('should handle select dropdown interactions', async () => {
      const handleChange = vi.fn();

      const select = document.createElement('select');
      select.onchange = handleChange;

      const option1 = document.createElement('option');
      option1.value = 'option1';
      option1.textContent = 'Option 1';

      const option2 = document.createElement('option');
      option2.value = 'option2';
      option2.textContent = 'Option 2';

      select.appendChild(option1);
      select.appendChild(option2);
      document.body.appendChild(select);

      await user.selectOptions(select, 'option2');

      expect(select.value).toBe('option2');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle file input interactions', async () => {
      const handleChange = vi.fn();

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = handleChange;

      document.body.appendChild(fileInput);

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await user.upload(fileInput, file);

      expect(handleChange).toHaveBeenCalled();
      expect(fileInput.files?.[0]).toBe(file);
    });
  });

  describe('Accessibility Interactions', () => {
    it('should handle ARIA attributes', async () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close dialog');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '×';

      document.body.appendChild(button);

      await user.click(button);

      expect(button.getAttribute('aria-label')).toBe('Close dialog');
    });

    it('should handle focus management', async () => {
      const input1 = document.createElement('input');
      input1.id = 'input1';

      const input2 = document.createElement('input');
      input2.id = 'input2';

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      input1.focus();
      expect(document.activeElement).toBe(input1);

      await user.tab();
      expect(document.activeElement).toBe(input2);

      await user.tab({ shift: true });
      expect(document.activeElement).toBe(input1);
    });

    it('should handle screen reader announcements', async () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.textContent = 'Initial message';

      document.body.appendChild(liveRegion);

      // Update live region
      liveRegion.textContent = 'Updated message';

      await waitFor(() => {
        expect(liveRegion.textContent).toBe('Updated message');
      });
    });
  });

  describe('Performance Interactions', () => {
    it('should handle rapid interactions', async () => {
      const handleClick = vi.fn();

      const button = document.createElement('button');
      button.textContent = 'Click me fast';
      button.onclick = handleClick;

      document.body.appendChild(button);

      // Simulate rapid clicks
      const clickPromises = Array.from({ length: 10 }, () => user.click(button));

      await Promise.all(clickPromises);

      expect(handleClick).toHaveBeenCalledTimes(10);
    });

    it('should handle debounced interactions', async () => {
      vi.useFakeTimers();

      let callCount = 0;
      const debouncedFunction = vi.fn(() => {
        callCount++;
      });

      const input = document.createElement('input');
      input.oninput = () => {
        setTimeout(debouncedFunction, 300);
      };

      document.body.appendChild(input);

      await user.type(input, 'test');

      // Fast-forward timer
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(debouncedFunction).toHaveBeenCalledTimes(1);
      });

      vi.useRealTimers();
    });
  });
});
