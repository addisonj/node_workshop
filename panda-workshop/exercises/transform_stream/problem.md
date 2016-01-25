## Task

Write a function that reads a file and uses a transform stream to rewrites all occurences of 'foo' to 'bar'

-----------------------------------------------------------------

## Description

Streams are a great way of dealing with files that we may want to manipulate in some way. This exercise will teach you how to create a readable stream from a file
and the details of creating a transform stream.

For details on implementing a transform stream, see the (transform stream docs)[https://nodejs.org/api/stream.html#stream_class_stream_transform). But for a tl;dr,
you will need to extend the `Transform` class from the `stream` node module. The core of implementing it will be to implement the `_transform` method which has a
signature of `(chunk: [String,Buffer], encoding: String, done: function)`.



