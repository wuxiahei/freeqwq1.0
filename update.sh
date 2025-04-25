#!/bin/bash

CONTAINER_NAME="wac-ai-platform"
IMAGE_NAME="dify-client"
TAG=$(date +%Y%m%d_%H%M%S)  # 使用时间戳作为标签

# 检查容器是否存在并停止删除
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

echo "Building new image..."
docker build -t $IMAGE_NAME:$TAG .

echo "Starting new container..."
docker run -d -p 3000:3000 --name $CONTAINER_NAME $IMAGE_NAME:$TAG

echo "Cleanup old images..."
docker image prune -f 