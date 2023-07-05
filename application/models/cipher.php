<?php

class Cipher {
	/**
	*/
    private $securekey, $iv;
    function secretpassphrase() {
        $this->securekey = hash('sha256',getenv('SECRET_KEY'),TRUE);
        $this->iv = mcrypt_create_iv(32);
        // $this->iv = openssl_random_pseudo_bytes(16);   // replaced mcrypt_create_iv because it is depreciated
    }
    function encrypt($input) {
        return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $this->securekey, $input, MCRYPT_MODE_ECB, $this->iv));
        // return base64_encode(openssl_encrypt($input, 'AES-256-CBC', $this->securekey, OPENSSL_RAW_DATA, $this->iv));
    }
    function decrypt($input) {
        return trim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $this->securekey, base64_decode($input), MCRYPT_MODE_ECB, $this->iv));
        // return trim(openssl_encrypt(base64_decode($input), 'aes-256-cbc', $this->securekey, OPENSSL_RAW_DATA, $this->iv));
    }
}