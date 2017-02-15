import React from 'react';
import { Editor, EditorState, RichUtils, CompositeDecorator } from 'draft-js';

import 'draft-js/dist/Draft.css';

const stocks = {
  FB: -0.50,
  AAPL: 0.03,
  GOOG: -0.23,
  '005930.KS': 0.37,
};

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

const Stock = (props) => {
  const {symbol} = props.contentState.getEntity(props.entityKey).getData();
  const stockValue = stocks[symbol];
  return (
    <span>{props.children} ({symbol} {stockValue < 0 ? '' : '+'}{stockValue}%)</span>
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
      editorState: EditorState.createEmpty(decorator),
      showStockInput: false,
      stockSymbol: '',
    };
    
    this.onChange = this.onChange.bind(this);
    this.addStock = this.addStock.bind(this);
    this.confirmStock = this.confirmStock.bind(this);
    this.onStockChange = (e) => { this.setState({ stockSymbol: e.target.value }); };
    this.onStockInputKeyDown = this.onStockInputKeyDown.bind(this);
  }

  onChange(editorState) {
    this.setState({editorState})
  }

  addStock() {
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = editorState.getSelection().getStartKey();
      const startOffset = editorState.getSelection().getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const stockKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let stockSymbol = '';
      if (stockKey) {
        const stockInstance = contentState.getEntity(stockKey);
        stockSymbol = stockInstance.getData().symbol;
      }

      this.setState({
        showStockInput: true,
        stockSymbol: stockSymbol,
      }, () => {
        setTimeout(() => this.refs.url.focus(), 0);
      });
    }
  }

  confirmStock(e) {
    e.preventDefault();
    const {editorState, stockSymbol} = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'STOCK',
      'MUTABLE',
      {symbol: stockSymbol}
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.setState({
      editorState: RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      ),
      showURLInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.editor.focus(), 0);
    });
  }

  onStockInputKeyDown(e) {
    if (e.which === 13) {
      this.confirmStock(e);
    }
  }

  render() {
    let stockInput;
    if (this.state.showStockInput) {
      stockInput =
        <div>
          <input
            onChange={this.onStockChange}
            ref="url"
            type="text"
            value={this.state.stockSymbol}
            onKeyDown={this.onStockInputKeyDown}
          />
          <button onMouseDown={this.confirmStock}>
            Confirm
          </button>
        </div>;
    }

    return (
      <div>
        <h1>Stock Editor</h1>
        <input
          type="button"
          value="Add stock"
          onClick={this.addStock}
        />
        {' '}
        <input
          type="button"
          value="Remove stock"
          onClick={this.addStock}
        />
        {stockInput}
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
