import random

WORDS = [
    "cat", "dog", "elephant", "giraffe", "lion", "tiger", "monkey", "zebra", "penguin", "dolphin",
    "chair", "table", "phone", "laptop", "bottle", "book", "pencil", "clock", "mirror", "umbrella",
    "running", "swimming", "dancing", "sleeping", "cooking", "reading", "jumping", "singing", "painting", "laughing",
    "apple", "banana", "pizza", "burger", "cake", "ice cream", "coffee", "bread", "cookie", "sandwich",
    "car", "bus", "train", "airplane", "bicycle", "boat", "rocket", "helicopter", "truck", "motorcycle"
]


def get_random_words(count=3):
    return random.sample(WORDS, count)