/*
 * @Author: kasora 
 * @Date: 2017-09-28 20:46:42 
 * @Last Modified by: kasora
 * @Last Modified time: 2017-10-09 18:31:54
 */
'use strict';

let config = {
  size: 10,
  tick: 120,
  heightBlocks: 'loading',
  widthBlocks: 'loading',
  aliveMax: 3,
  aliveMin: 2,
  alpha: 0.4,
  background: [255, 255, 255, 1],
  // background: [54, 54, 54, 1], // rgba
  createRate: 0.08,
  mode: 'random', // String 'random' or rgba(or rgb) Array
  // mode: [131, 139, 139],
  autoRestart: true,
  restartTime: 2500
};

function getColor() {
  return [Math.random() * 255, Math.random() * 255, Math.random() * 255, config.alpha]
}

function initConfig() {
  config.heightBlocks = parseInt(document.body.clientHeight / config.size) + 1;
  config.widthBlocks = parseInt(document.body.clientWidth / config.size) + 1;
  config.jump = config.alpha / (config.restartTime / config.tick);

  if (Array.isArray(config.mode) && config.mode.length === 3) {
    config.mode.push(config.alpha);
  }
}

function initCanvas(canvas) {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
}

function initData() {
  let data = [];

  for (let i = 0; i < config.heightBlocks; i++) {
    let tempRow = [];
    for (let j = 0; j < config.widthBlocks; j++) {
      tempRow.push(Math.random() < config.createRate ?
        Array.isArray(config.mode) ? config.mode : getColor() :
        config.background
      )
      // tempRow.push(config.background);
    }
    data.push(tempRow);
  }
  data[1][1] = [125, 125, 125, 0.5];
  data[1][3] = [125, 125, 125, 0.5];

  let dataList = [];
  dataList.push(data);
  dataList.push(getNextTick(getList(data)));
  return dataList;
}

function draw(canvas, data) {
  let ctx = canvas.getContext("2d")

  ctx.clearRect(0, 0, config.widthBlocks * config.size, config.heightBlocks * config.size);
  ctx.fillStyle = `rgba(${config.background.join(',')})`
  ctx.fillRect(0, 0, config.widthBlocks * config.size, config.heightBlocks * config.size);
  if (canvas.getContext) {
    for (let i = 0; i < config.heightBlocks; i++) {
      for (let j = 0; j < config.widthBlocks; j++) {
        let intrgba = config.background;
        if (!isEmpty(data[i][j])) {
          intrgba = data[i][j].map(item => parseInt(item));
          intrgba[3] = config.alpha;
        }
        ctx.fillStyle = `rgba(${intrgba.join(',')})`
        ctx.fillRect(j * config.size, i * config.size, config.size, config.size);
      }
    }
  }
}

function isEmpty(block) {
  for (let i = 0; i < block.length; i++) {
    if (block[i] !== config.background[i]) {
      return false;
    }
  }
  return true;
}

function isDead(blockData1, blockData2) {
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (isEmpty(blockData1[i][j]) !== isEmpty(blockData2[i][j])) {
        return false;
      }
    }
  }
  return true;
}

function getList(data) {
  let blockList = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (!isEmpty(data[i][j])) {
        blockList.push({
          row: i,
          col: j,
          color: data[i][j]
        })
      }
    }
  }

  return blockList;
}

function createData(blockList) {
  let data = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    data.push(new Array(config.widthBlocks).fill(config.background));
  }

  for (let blockInfo of blockList) {
    data[blockInfo.row][blockInfo.col] = blockInfo.color;
  }

  return data;
}

function getNextTick(blockList) {
  let dataCount = [];
  let data = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    dataCount.push(new Array(config.widthBlocks).fill(0));
    data.push(new Array(config.widthBlocks).fill(config.background));
  }
  for (let blockInfo of blockList) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        let row = (config.heightBlocks - 1 + blockInfo.row + i) % (config.heightBlocks - 1);
        let col = (config.widthBlocks - 1 + blockInfo.col + j) % (config.widthBlocks - 1);
        dataCount[row][col]++;
      }
    }
  }

  for (let block of blockList) {
    if (dataCount[block.row][block.col] >= config.aliveMin && dataCount[block.row][block.col] <= config.aliveMax) {
      data[block.row][block.col] = block.color;
    }
  }
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (dataCount[i][j] === config.aliveMax && isEmpty(data[i][j])) {
        data[i][j] = Array.isArray(config.mode) ? config.mode : getColor()
      }
    }
  }

  return data;
}

function jumpToAlpha(alpha) {
  // 自动吸附
  if (Math.abs(alpha - config.alpha) < config.jump) {
    config.alpha = alpha;
  }

  // 向指定 alpha 值移动
  config.alpha = config.alpha > alpha ?
    config.alpha - config.jump :
    config.alpha + config.jump
}

function startGame() {
  initConfig();

  let deadFlag = false;
  let originAlpha = config.alpha;
  config.alpha = 0;

  let canvas = document.getElementById("game");
  initCanvas(canvas);
  let dataList = initData();
  setInterval(function () {
    // 绘制图像
    draw(canvas, dataList[1]);

    // 渐显
    if (!deadFlag) jumpToAlpha(originAlpha);

    // 计算下一帧
    dataList.push(getNextTick(getList(dataList[1])));
    let preData = dataList.shift();

    if (config.autoRestart) {
      if (deadFlag) {
        // 渐隐
        jumpToAlpha(0)

        if (config.alpha === 0) {
          dataList = initData();
          deadFlag = false;
        }
      }
      if (deadFlag || isDead(dataList[1], preData)) {
        deadFlag = true;
      }
    }
  }, config.tick);
}