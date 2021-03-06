/**
 * Created by DengYun on 2017/6/21.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Fetch extends PureComponent {
  static propTypes = {
    url: PropTypes.string,
    options: PropTypes.shape({
      method: PropTypes.string,
    }),
    doFetch: PropTypes.func,
    type: PropTypes.oneOf(['text', 'json', 'blob']).isRequired,
  };

  static defaultProps = {
    type: 'json',
    options: {
      credentials: 'same-origin',
    },
  };

  static childPropTypes = {
    loading: PropTypes.bool,
    data: PropTypes.object,
    error: PropTypes.instanceOf(Error),
  };

  state = {
    loading: true,
    statusCode: null,
    data: null,
    error: null,
  };

  componentDidMount() {
    this.doFetch();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.url !== this.props.url ||
      prevProps.type !== this.props.type
    ) {
      this.doFetch();
    }
  }

  componentWillUnmount() {
    this.fetching = null;
  }

  reload = () => {
    this.doFetch(this.props);
  };

  doFetch() {
    const { url, options, type, doFetch } = this.props;
    let promise;
    this.setState({
      loading: true,
    });
    promise = (doFetch
      ? doFetch(url)
      : fetch(url, options).then(resp => {
          this.setState({
            statusCode: resp.status,
          });
          return resp[type]();
        })
    ).then(
      data => {
        this.setState({
          loading: false,
          data,
          error: null,
        });
      },
      error => {
        if (promise === this.fetching) {
          this.setState({
            loading: false,
            data: null,
            error,
          });
        }
      },
    );
    this.fetching = promise;
  }

  render() {
    const { children } = this.props;
    if (typeof children === 'function') {
      return children({
        ...this.state,
        reload: this.reload,
      });
    }
    return React.cloneElement(children, {
      ...this.state,
      reload: this.reload,
    });
  }
}
