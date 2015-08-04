/*
 * Brackets 'paragraph navigation' extension.
 *
 * Copyright (c) 2015 Sergey Pershin. All rights reserved.
 * Distributed under an MIT license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

define(function (require) {

    "use strict";

   var CommandManager = brackets.getModule("command/CommandManager");
   var EditorManager = brackets.getModule("editor/EditorManager");
   var Menus = brackets.getModule("command/Menus");
   var KeyBindingManager = brackets.getModule("command/KeyBindingManager");

   function getMaxLine (editor) {
      return editor.document._masterEditor._codeMirror.doc.size - 1;
   }
   
   function findLine (editor, pos, forward, check) {
      forward = forward ? 1 : -1;
      var maxLine = getMaxLine(editor);
      
      for (; pos >= 0 && pos <= maxLine; pos += forward) {
         var line = editor.document.getLine(pos),
             isFound = false;
         
         if (check instanceof Function) {
            isFound = check(line);
         } else {
            isFound = (check == line);
         }

         if (isFound) {
            return pos;
         }
      }
      
      return -1;
   }
   
   function lineIsEmpty (line) {
      return line.trim() === '';
   };
   
   function lineIsNotEmpty (line) {
      return line.trim() !== '';
   };
   
   function locateParagraph (forward, select) {
      var editor = EditorManager.getActiveEditor();
      
      var selection = editor.getSelection();
      if (selection.reversed) {
         var temp = selection.start;
         selection.start = selection.end;
         selection.end = temp;
      }
      
      var line = selection.end.line;
      if (forward) {
         (line = findLine(editor, line, true, lineIsEmpty)) != -1 
            && (line = findLine(editor, line, true, lineIsNotEmpty)) != -1 
            || (line = getMaxLine(editor));
      } else {
         (line = findLine(editor, line, false, lineIsEmpty)) != -1
            && (line = findLine(editor, line, false, lineIsNotEmpty)) != -1
            && (line = findLine(editor, line, false, lineIsEmpty)) != -1
            && ((line += 1) || true)
            || (line = 0);
      }
            
      var ch = editor.document.getLine(line).match(/\s*/)[0].length;
      if (select) {
         editor.setSelection(selection.start, {line: line, ch: ch}, false, 0);
      } else {
         editor.setCursorPos(line, ch);
      }
   }
   
   function gotoNextParagraph (select) {
      locateParagraph(true, false);
   }
   
   function gotoPrevParagraph (select) {
      locateParagraph(false, false);
   }
   
   function selectNextParagraph () {
      locateParagraph(true, true);
   }
   
   function selectPrevParagraph () {
      locateParagraph(false, true);
   }
   
   function createAction (title, id, func, key) {
      CommandManager.register(title, id, func);
      KeyBindingManager.removeBinding(key);
      KeyBindingManager.addBinding(id, key);
   }

   function init() {
      createAction("Goto next paragraph", "segrey.paragraph.gotoNext", gotoNextParagraph, "Ctrl-Down");
      createAction("Goto prev paragraph", "segrey.paragraph.gotoPrev", gotoPrevParagraph, "Ctrl-Up");
      createAction("Select next paragraph", "segrey.paragraph.selectNext", selectNextParagraph, "Ctrl-Shift-Down");
      createAction("Select prev paragraph", "segrey.paragraph.selectPrev", selectPrevParagraph, "Ctrl-Shift-Up");
   }
   
   init();
});
