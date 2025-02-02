import {
  Box,
  Button,
  CircularProgress,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import useMutation from '../hooks/useMutations';
import useQuery from '../hooks/useQuery';

const validFileTypes = ['image/jpg', 'image/jpeg', 'image/png'];
const URL = '/images';
const uploadURL = '/uploadImages';

const ErrorText = ({ children, ...props }) => (
  <Text fontSize="lg" color="red.300" {...props}>
    {children}
  </Text>
);

const Posts = () => {
  const [timeoutting, setTimeoutting] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const {
    mutate: uploadImage,
    isLoading: uploading,
    error: uploadError,
  } = useMutation({ url: uploadURL });

  const {
    data: imageUrls = [],
    isLoading: imagesLoading,
    error: fetchError,
  } = useQuery(URL, refetch);

  const [error, setError] = useState('');

  const handleUpload = async e => {
    const files = e.target.files;
    console.log('files.length ' + files.length);
    const form = new FormData();
    for (const file of files) {
      if (!validFileTypes.find(type => type === file.type)) {
        setError('File must be in JPG/PNG format');
        return;
      }
      form.append('images[]', file);
    }

    await uploadImage(form);

    // Wait one second to refresh the page after the image has been uploaded.
    //Don't recommended.
    if (
      timeoutting === false &&
      fetchError == '' &&
      fetchError == null &&
      uploadError == '' &&
      uploadError == null
    ) {
      setTimeoutting(true);
      setTimeout(() => {
        setTimeoutting(false);
        setRefetch(s => s + 1);
      }, 5000);
    }
  };

  const handleRefetch = async e => {
    console.log('handleRefetch');
    setRefetch(s => s + 1);
  };

  return (
    <Box mt={6}>
      <Input
        id="imageInput"
        type="file"
        multiple="multiple"
        hidden
        onChange={handleUpload}
      />
      <Button
        as="label"
        htmlFor="imageInput"
        colorScheme="blue"
        variant="outline"
        mb={3}
        cursor="pointer"
        isLoading={uploading}
      >
        Upload
      </Button>

      <Input id="cacheInput" type="button" hidden onClick={handleRefetch} />
      <Button
        as="label"
        htmlFor="cacheInput"
        colorScheme="red"
        variant="outline"
        mb={3}
        cursor="pointer"
      >
        TestCache
      </Button>

      {error && <ErrorText>{error}</ErrorText>}
      {uploadError && <ErrorText>{uploadError}</ErrorText>}

      <Text textAlign="left" mb={4}>
        Posts
      </Text>
      {imagesLoading && (
        <CircularProgress
          color="gray.600"
          trackColor="blue.300"
          size={7}
          thickness={10}
          isIndeterminate
        />
      )}
      {fetchError && (
        <ErrorText textAlign="left">Failed to load images</ErrorText>
      )}
      {!fetchError && imageUrls?.length === 0 && (
        <Text textAlign="left" fontSize="lg" color="gray.500">
          No images found
        </Text>
      )}

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {imageUrls?.length > 0 &&
          imageUrls.map(url => (
            <Image borderRadius={5} src={url} alt="Image" key={url} />
          ))}
      </SimpleGrid>
    </Box>
  );
};
export default Posts;
