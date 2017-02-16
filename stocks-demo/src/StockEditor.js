import React from 'react';
import { Editor, EditorState, RichUtils, CompositeDecorator, convertFromRaw, convertToRaw } from 'draft-js';

import 'draft-js/dist/Draft.css';

import Stock from './Stock';

import editorContent from './editorContent.json';

const findStockEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'STOCK'
      );
    },
    callback
  );
};

class StockEditor extends React.Component {
  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findStockEntities,
        component: Stock,
      },
    ]);

    this.state = {
      editorState: EditorState.createWithContent(
        convertFromRaw(editorContent),
        decorator,
      ),
      showStockInput: false,
      stockSymbol: '',
    };

    this.onChange = this.onChange.bind(this);
    this.addStock = this.addStock.bind(this);
    this.logState = () => {
      console.log(convertToRaw(this.state.editorState.getCurrentContent()));
    };
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  addStock() {
    const { editorState } = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();

      const stockSymbol = window.prompt('Enter stock symbol');

      const contentStateWithEntity = contentState.createEntity(
        'STOCK',
        'MUTABLE',
        { symbol: stockSymbol }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(
        editorState, { currentContent: contentStateWithEntity }
      );
      this.setState({
        editorState: RichUtils.toggleLink(
          newEditorState,
          newEditorState.getSelection(),
          entityKey
        ),
      }, () => {
        setTimeout(() => this.editor.focus(), 0);
      });
    }
  }

  render() {
    return (
      <div>
        <h1>Stock Editor</h1>
        <input
          type="button"
          value="Add stock"
          onClick={this.addStock}
        />
        <input
          type="button"
          value="Log state"
          onClick={this.logState}
        />
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange}
          ref={(e) => { this.editor = e; }}
        />
      </div>
    );
  }
}

export default StockEditor;
