/*
 * @Author: kasora 
 * @Date: 2017-09-28 20:46:42 
 * @Last Modified by: kasora
 * @Last Modified time: 2017-10-08 19:48:25
 */
'use strict';

let config = {
  size: 10,
  tick: 100,
  heightBlocks: 'loading',
  widthBlocks: 'loading',
  aliveMax: 3,
  aliveMin: 2,
  alpha: 0.3,
  defaultColor: [255, 255, 255], // rgb
  createRate: 0.1
};

function init(canvas) {
  config.heightBlocks = parseInt(document.body.clientHeight / config.size) + 1;
  config.widthBlocks = parseInt(document.body.clientWidth / config.size) + 1;
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  if (config.defaultColor.length === 3) {
    config.defaultColor.push(config.alpha);
  }

  let data = [];

  for (let i = 0; i < config.heightBlocks; i++) {
    let tempRow = [];
    for (let j = 0; j < config.widthBlocks; j++) {
      tempRow.push(Math.random() < config.createRate ?
        [Math.random() * 255, Math.random() * 255, Math.random() * 255, config.alpha] :
        config.defaultColor
      )
      // tempRow.push(config.defaultColor);
    }
    data.push(tempRow);
  }
  data[1][1] = [125, 125, 125, 0.5];
  data[1][3] = [125, 125, 125, 0.5];
  return data;
}

function draw(canvas, data) {
  let ctx = canvas.getContext("2d")

  ctx.clearRect(0, 0, config.widthBlocks * config.size, config.heightBlocks * config.size);
  if (canvas.getContext) {
    for (let i = 0; i < config.heightBlocks; i++) {
      for (let j = 0; j < config.widthBlocks; j++) {
        let intrgba = data[i][j].map(item => parseInt(item));
        intrgba[3] = config.alpha;
        ctx.fillStyle = `rgba(${intrgba.join(',')})`
        ctx.fillRect(j * config.size, i * config.size, config.size, config.size);
      }
    }
  }
}

function isEmpty(block) {
  for (let i = 0; i < block.length; i++) {
    if (block[i] !== config.defaultColor[i]) {
      return false;
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
    data.push(new Array(config.widthBlocks).fill(config.defaultColor));
  }

  for (let blockInfo of blockList) {
    data[blockInfo.row][blockInfo.col] = blockInfo.color;
  }

  return data;
}

function nextTick(blockList) {
  let dataCount = [];
  let data = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    dataCount.push(new Array(config.widthBlocks).fill(0));
    data.push(new Array(config.widthBlocks).fill(config.defaultColor));
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
        data[i][j] = [Math.random() * 255, Math.random() * 255, Math.random() * 255, config.alpha]
      }
    }
  }

  return data;
}

function startGame() {
  let canvas = document.getElementById("game");
  let data = init(canvas);
  setInterval(function () {
    let blockList = getList(data);
    data = nextTick(blockList);
    draw(canvas, data);
  }, config.tick);
}