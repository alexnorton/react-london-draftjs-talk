import React from 'react';
import { ContentState } from 'draft-js';

const stocks = {
  FB: -0.50,
  AAPL: 0.03,
  '005930.KS': 0.37,
  AMZN: 0.75,
};

const Stock = (props) => {
  const { symbol } = props.contentState.getEntity(props.entityKey).getData();
  const stockValue = stocks[symbol];
  const positive = stockValue >= 0;

  const annotation = (
    <span contentEditable={false}>
      {' '}
      (
      {symbol}{stockValue ? (
        <span style={{ color: positive ? 'green' : 'red' }}>
          {positive ? ' +' : ' '}{stockValue}%
        </span>
      ) : ''}
      )
    </span>
  );

  return (
    <span style={{ background: '#ccc' }}>
      {props.children}{annotation}
    </span>
  );
};

Stock.propTypes = {
  contentState: React.PropTypes.instanceOf(ContentState),
  entityKey: React.PropTypes.string,
  children: React.PropTypes.node,
};

export default Stock;
