const logger = require('../utils/logger');

describe('logger', () => {
  it('logs info', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
}); 